const { PrismaClient } = require('./prisma/generated/client');

async function testReviewsAPI() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing reviews API...');
    
    // Test basic connection
    console.log('1. Testing Prisma connection...');
    await prisma.$connect();
    console.log('✓ Prisma connected successfully');
    
    // Test finding reviews (this mimics the GET request)
    console.log('2. Testing review query...');
    const testProductId = '507f1f77bcf86cd799439011'; // Example ObjectId
    
    const reviews = await prisma.review.findMany({
      where: { productId: testProductId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    
    console.log('✓ Review query successful, found:', reviews.length, 'reviews');
    
    // Test aggregation (this mimics the stats query)
    console.log('3. Testing review aggregation...');
    const stats = await prisma.review.aggregate({
      where: { productId: testProductId },
      _avg: { rating: true },
      _count: true,
    });
    
    console.log('✓ Aggregation successful:', stats);
    
    // Test CustomerEvent creation (this mimics the event logging)
    console.log('4. Testing CustomerEvent creation...');
    const testUserId = '507f1f77bcf86cd799439012'; // Example ObjectId
    
    // Check if customer exists first
    const customer = await prisma.customer.findUnique({
      where: { id: testUserId }
    });
    
    if (!customer) {
      console.log('! Test customer not found, skipping event creation test');
    } else {
      const event = await prisma.customerEvent.create({
        data: {
          userId: testUserId,
          eventType: "read_reviews",
          timestamp: new Date(),
          context: {
            productId: testProductId,
            reviewCount: reviews.length,
          },
        }
      });
      console.log('✓ CustomerEvent created successfully:', event.id);
    }
    
  } catch (error) {
    console.error('❌ Error testing reviews API:', error);
    console.error('Error details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testReviewsAPI();
