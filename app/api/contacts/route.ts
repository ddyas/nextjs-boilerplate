import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    // Get the LinkedIn URL from the query string
    const { searchParams } = new URL(request.url);
    const linkedinUrl = searchParams.get('url');

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    // Get the contact from the database
    const db = client.db();
    const contact = await db.collection('contacts').findOne({ 
      linkedInProfileUrl: decodeURIComponent(linkedinUrl)
    });

    await client.close();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Return the contact info
    return NextResponse.json({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phoneNumber: contact.phoneNumber,
      company: contact.company,
      jobTitle: contact.jobTitle
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
