import { NextRequest, NextResponse } from 'next/server';
import { Query, AppwriteException } from 'node-appwrite';
import { backendDB } from "@/lib/appwrite/backend";


const DB_ID = process.env.APPWRITE_DATABASE_ID!;
const COLLECTION = process.env.APPWRITE_EVENTS_COLLECTION_ID!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const isCompleted = searchParams.get('completed');
    const queries = [
      Query.limit(limit),
      Query.offset((page - 1) * limit),
      Query.orderDesc('$createdAt'),
      Query.equal('fest', 'brahma')
    ];

    if (search && search.length > 0) {
      queries.push(Query.search('event_name', search));
    }

    if (category && category !== 'all') {
      queries.push(Query.equal('category', category));
    }

    if (isCompleted !== null && isCompleted !== undefined) {
      queries.push(Query.equal('completed', isCompleted === 'true'));
    }

    const response = await backendDB.listDocuments(
      DB_ID,
      COLLECTION,
      queries
    );

    return NextResponse.json({
      data: response.documents,
      total: response.total,
      page,
      limit,
      totalPages: Math.ceil(response.total / limit),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
      }
    });

  } catch (error: any) {
    console.error('Appwrite Fetch Error:', error);

    // Handle Appwrite-specific exceptions (e.g., missing index)
    if (error instanceof AppwriteException) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code || 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching events.' },
      { status: 500 }
    );
  }
}