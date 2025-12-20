import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decryptTicketQR, parseQRPayload, generateScannerToken, TicketScanResult } from '@/lib/ticketQREncryption';

/**
 * POST /api/admin/scan-ticket
 * 
 * Scanner endpoint that decrypts and verifies ticket QR codes
 * Only accessible to authorized ticket scanners
 * 
 * Request body:
 * {
 *   qrData: { encrypted, hmac, timestamp, expiresAt },
 *   scannerAddress: "0x...",
 *   scannerRole: "event_scanner" | "venue_scanner" | "admin"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrData, scannerAddress, scannerRole } = body;

    // Validate scanner authorization
    if (!scannerAddress || !scannerRole) {
      return NextResponse.json(
        { error: 'Missing scanner authorization info' },
        { status: 401 }
      );
    }

    // Verify scanner is authorized (check against database)
    const { data: scanner, error: scannerError } = await supabase
      .from('users')
      .select('id, role')
      .eq('wallet_address', scannerAddress)
      .single();

    if (scannerError || !scanner) {
      return NextResponse.json(
        { error: 'Scanner not found or unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has scanner role
    const hasPermission = ['admin', 'event_organizer', 'venue_manager'].includes(scanner.role);
    if (!hasPermission && scannerRole !== 'event_scanner') {
      return NextResponse.json(
        { error: 'Insufficient permissions to scan tickets' },
        { status: 403 }
      );
    }

    // Parse and decrypt QR
    let encryptedQR;
    try {
      encryptedQR = parseQRPayload(JSON.stringify(qrData));
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid QR code format' },
        { status: 400 }
      );
    }

    // Decrypt ticket data
    const scanResult = decryptTicketQR(encryptedQR) as TicketScanResult;

    if (!scanResult.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: scanResult.error,
          expired: scanResult.expired,
        },
        { status: 400 }
      );
    }

    // Generate scanner token (prevents duplicate scans)
    const scannerToken = generateScannerToken(scannerAddress, scanResult.data!.ticketId);

    // Check if ticket was already scanned
    const { data: existingScan } = await supabase
      .from('ticket_scans')
      .select('id')
      .eq('ticket_id', scanResult.data!.ticketId)
      .eq('scanner_token', scannerToken)
      .single();

    if (existingScan) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Ticket already scanned',
          data: scanResult.data,
        },
        { status: 409 }
      );
    }

    // Verify ticket exists and is valid
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', scanResult.data!.ticketId)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Ticket not found in database',
          data: scanResult.data,
        },
        { status: 404 }
      );
    }

    // Record the scan
    const { error: scanError } = await supabase
      .from('ticket_scans')
      .insert({
        ticket_id: scanResult.data!.ticketId,
        event_id: scanResult.data!.eventId,
        scanner_address: scannerAddress,
        scanner_token: scannerToken,
        ticket_status: ticket.status,
        is_valid: true,
        notes: `Scanned by ${scannerRole} at ${new Date().toISOString()}`,
      });

    if (scanError) {
      console.error('Error recording scan:', scanError);
      // Don't fail the response, scan still succeeded
    }

    // Update ticket status to 'scanned' or 'verified'
    await supabase
      .from('tickets')
      .update({ status: 'verified' })
      .eq('id', scanResult.data!.ticketId);

    return NextResponse.json({
      valid: true,
      scannerVerified: true,
      data: scanResult.data,
      scannerToken,
      message: 'Ticket verified successfully',
      scanTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Scanner error:', error);
    return NextResponse.json(
      { error: 'Server error during ticket verification', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/scan-ticket
 * 
 * Get scan history for a ticket
 */
export async function GET(request: NextRequest) {
  try {
    const ticketId = request.nextUrl.searchParams.get('ticketId');
    const eventId = request.nextUrl.searchParams.get('eventId');

    if (!ticketId && !eventId) {
      return NextResponse.json(
        { error: 'Missing ticketId or eventId parameter' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('ticket_scans')
      .select('*')
      .order('scanned_at', { ascending: false });

    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    } else if (eventId) {
      query = query.eq('event_id', parseInt(eventId));
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      scans: data || [],
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching scans:', error);
    return NextResponse.json(
      { error: 'Error fetching scan history' },
      { status: 500 }
    );
  }
}
