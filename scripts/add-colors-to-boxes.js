const { PrismaClient } = require('../prisma/generated/client')

const prisma = new PrismaClient()

async function addColorsToBoxes() {
  console.log('=== إضافة ألوان للصناديق للعرض ثلاثي الأبعاد ===')
  
  try {
    // جلب جميع الصناديق
    const boxes = await prisma.box.findMany()
    console.log(`وجد ${boxes.length} صندوق`)
    
    let updatedBoxes = 0
    
    for (const box of boxes) {
      let boxColor = box.color
      
      // إذا لم يكن للصندوق لون محدد، نحدد لون بناء على اسمه
      if (!boxColor || boxColor.trim() === '') {
        const boxName = box.name.toLowerCase()
        
        if (boxName.includes('ذهبي') || boxName.includes('gold')) {
          boxColor = '#FFD700' // ذهبي
        } else if (boxName.includes('أحمر') || boxName.includes('red')) {
          boxColor = '#DC2626' // أحمر
        } else if (boxName.includes('أزرق') || boxName.includes('blue')) {
          boxColor = '#2563EB' // أزرق
        } else if (boxName.includes('وردي') || boxName.includes('pink')) {
          boxColor = '#EC4899' // وردي
        } else if (boxName.includes('أسود') || boxName.includes('black')) {
          boxColor = '#1F2937' // أسود
        } else if (boxName.includes('أبيض') || boxName.includes('white')) {
          boxColor = '#F8FAFC' // أبيض
        } else if (boxName.includes('بني') || boxName.includes('brown')) {
          boxColor = '#92400E' // بني
        } else if (boxName.includes('أخضر') || boxName.includes('green')) {
          boxColor = '#16A34A' // أخضر
        } else {
          // لون افتراضي حسب الحجم
          if (box.size === 'صغير') {
            boxColor = '#2563EB' // أزرق للصغير
          } else if (box.size === 'متوسط') {
            boxColor = '#DC2626' // أحمر للمتوسط
          } else if (box.size === 'كبير') {
            boxColor = '#FFD700' // ذهبي للكبير
          } else {
            boxColor = '#6B7280' // رمادي افتراضي
          }
        }
      } else {
        // تحويل أسماء الألوان العربية إلى أكواد hex
        if (boxColor === 'ذهبي') {
          boxColor = '#FFD700'
        } else if (boxColor === 'أحمر') {
          boxColor = '#DC2626'
        } else if (boxColor === 'أزرق') {
          boxColor = '#2563EB'
        } else if (boxColor === 'وردي') {
          boxColor = '#EC4899'
        } else if (boxColor === 'أسود') {
          boxColor = '#1F2937'
        } else if (boxColor === 'أبيض') {
          boxColor = '#F8FAFC'
        } else if (boxColor === 'بني') {
          boxColor = '#92400E'
        } else if (boxColor === 'أخضر') {
          boxColor = '#16A34A'
        }
        // إذا كان اللون بالفعل كود hex، نتركه كما هو
      }
      
      // تحديث الصندوق باللون الجديد
      await prisma.box.update({
        where: { id: box.id },
        data: { color: boxColor }
      })
      
      console.log(`✅ تم تحديث ${box.name}: ${box.color} → ${boxColor}`)
      updatedBoxes++
    }
    
    console.log(`\n🎨 تم تحديث ${updatedBoxes} صندوق بالألوان الجديدة`)
    
    // عرض النتائج النهائية
    console.log('\n--- الصناديق مع الألوان الجديدة ---')
    const updatedBoxesList = await prisma.box.findMany({
      select: { name: true, size: true, color: true, width: true, height: true, depth: true }
    })
    
    updatedBoxesList.forEach(box => {
      console.log(`📦 ${box.name}:`)
      console.log(`   الحجم: ${box.size}`)
      console.log(`   اللون: ${box.color}`)
      console.log(`   الأبعاد: ${box.width}x${box.height}x${box.depth} سم`)
      console.log()
    })
    
    console.log('🎉 تم إضافة الألوان للصناديق بنجاح! الآن ستظهر بالألوان الصحيحة في العرض ثلاثي الأبعاد.')
    
  } catch (error) {
    console.error('❌ خطأ في إضافة الألوان:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addColorsToBoxes()
