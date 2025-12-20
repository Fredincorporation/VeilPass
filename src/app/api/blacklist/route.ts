import { NextRequest, NextResponse } from 'next/server';
import blacklistManager from '@/lib/blacklistManager';

/**
 * GET /api/blacklist
 * Fetch blacklist entries (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') as any;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // TODO: Verify admin role
    const entries = await blacklistManager.getBlacklistEntries(reason, limit);

    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Failed to fetch blacklist' }, { status: 500 });
  }
}

/**
 * POST /api/blacklist
 * Add entry to blacklist (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idHash, reason, notes } = body;

    if (!idHash || !reason) {
      return NextResponse.json(
        { error: 'idHash and reason are required' },
        { status: 400 }
      );
    }

    // TODO: Verify admin role
    const adminAddress = '0xadmin'; // Should come from auth context

    const entry = await blacklistManager.addToBlacklist(idHash, reason, adminAddress, notes);

    if (!entry) {
      return NextResponse.json({ error: 'Failed to add to blacklist' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Entry added to blacklist',
      data: entry,
    });
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/blacklist/:hash
 * Remove entry from blacklist (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const idHash = pathname.split('/').pop();

    if (!idHash) {
      return NextResponse.json({ error: 'idHash is required' }, { status: 400 });
    }

    // TODO: Verify admin role
    const success = await blacklistManager.removeFromBlacklist(idHash);

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove from blacklist' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Entry removed from blacklist',
    });
  } catch (error) {
    console.error('Error removing from blacklist:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
