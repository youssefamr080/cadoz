const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

// مجموعة من التاجز المقترحة للإلهامات
const inspirationTags = {
  wedding: ['زواج', 'عرس', 'عروس', 'عريس', 'خطوبة', 'مناسبة خاصة', 'احتفال'],
  birthday: ['عيد ميلاد', 'احتفال', 'هدية', 'مفاجأة', 'سعادة', 'ذكرى'],
  graduation: ['تخرج', 'نجاح', 'إنجاز', 'دراسة', 'مستقبل', 'فخر'],
  anniversary: ['ذكرى', 'حب', 'رومانسية', 'زواج', 'احتفال', 'مناسبة خاصة'],
  valentine: ['حب', 'رومانسية', 'عيد الحب', 'مشاعر', 'هدية حب', 'قلب'],
  mothersday: ['عيد الأم', 'أم', 'حنان', 'تقدير', 'امتنان', 'عائلة'],
  fathersday: ['عيد الأب', 'أب', 'قوة', 'حماية', 'دعم', 'عائلة'],
  newborn: ['مولود جديد', 'طفل', 'براءة', 'فرحة', 'عائلة', 'بداية جديدة'],
  christmas: ['كريسماس', 'عيد الميلاد', 'احتفال', 'عائلة', 'فرحة', 'هدايا'],
  eid: ['عيد', 'فرحة', 'احتفال', 'عائلة', 'تقاليد', 'سعادة'],
  travel: ['سفر', 'مغامرة', 'ذكريات', 'استكشاف', 'رحلة', 'تجربة'],
  friendship: ['صداقة', 'أصدقاء', 'وفاء', 'مشاركة', 'ذكريات', 'حب'],
  success: ['نجاح', 'إنجاز', 'فخر', 'تحقيق', 'هدف', 'تقدير'],
  apology: ['اعتذار', 'أسف', 'مصالحة', 'حب', 'تقدير', 'احترام'],
  thankyou: ['شكر', 'امتنان', 'تقدير', 'عرفان', 'محبة', 'احترام']
};

// محتوى مقترح للإلهامات
const contentTemplates = {
  wedding: 'يوم زفافكم هو بداية قصة حب جديدة، لحظات لا تُنسى تستحق أجمل الذكريات وأرقى الهدايا التي تعبر عن مشاعركم الصادقة وتضيف لمسة سحرية لهذا اليوم المميز.',
  birthday: 'عيد ميلاد سعيد! يوم مليء بالفرحة والمفاجآت الجميلة. كل عام وأنت بألف خير، نتمنى لك عاماً مليئاً بالإنجازات والسعادة والذكريات الجميلة.',
  graduation: 'تخرجك هو تتويج لسنوات من الجد والاجتهاد. إنجاز رائع يستحق الاحتفال والتقدير. نفخر بك ونتمنى لك مستقبلاً مشرقاً مليئاً بالنجاحات.',
  anniversary: 'ذكرى سنوية مميزة تستحق الاحتفال. سنوات من الحب والسعادة والذكريات الجميلة. كل عام وأنتم بألف خير وحب.',
  valentine: 'عيد الحب، يوم التعبير عن المشاعر الصادقة والحب الحقيقي. لحظات رومانسية تستحق أجمل الهدايا وأرق الكلمات.',
  general: 'لحظات خاصة تستحق هدايا مميزة تعبر عن مشاعرك الصادقة وتترك أثراً جميلاً في قلوب الأحباب.'
};

async function updateInspirations() {
  try {
    console.log('🔄 بدء تحديث الإلهامات...');

    // جلب جميع الإلهامات الموجودة
    const inspirations = await prisma.inspiration.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true
      }
    });

    console.log(`📊 تم العثور على ${inspirations.length} إلهام للتحديث`);

    for (const inspiration of inspirations) {
      // تحديد نوع الإلهام بناءً على الاسم والوصف
      let inspirationType = 'general';
      let tags = ['إلهام', 'هدية', 'مناسبة'];
      let content = contentTemplates.general;

      const text = `${inspiration.name} ${inspiration.description}`.toLowerCase();

      // تحديد نوع الإلهام وإضافة التاجز المناسبة
      if (text.includes('زواج') || text.includes('عرس') || text.includes('عروس')) {
        inspirationType = 'wedding';
        tags = [...tags, ...inspirationTags.wedding];
        content = contentTemplates.wedding;
      } else if (text.includes('عيد ميلاد') || text.includes('مولد')) {
        inspirationType = 'birthday';
        tags = [...tags, ...inspirationTags.birthday];
        content = contentTemplates.birthday;
      } else if (text.includes('تخرج') || text.includes('نجاح')) {
        inspirationType = 'graduation';
        tags = [...tags, ...inspirationTags.graduation];
        content = contentTemplates.graduation;
      } else if (text.includes('ذكرى') || text.includes('سنوية')) {
        inspirationType = 'anniversary';
        tags = [...tags, ...inspirationTags.anniversary];
        content = contentTemplates.anniversary;
      } else if (text.includes('حب') || text.includes('رومانسية')) {
        inspirationType = 'valentine';
        tags = [...tags, ...inspirationTags.valentine];
        content = contentTemplates.valentine;
      } else if (text.includes('أم') || text.includes('أمي')) {
        tags = [...tags, ...inspirationTags.mothersday];
      } else if (text.includes('أب') || text.includes('أبي')) {
        tags = [...tags, ...inspirationTags.fathersday];
      } else if (text.includes('طفل') || text.includes('مولود')) {
        tags = [...tags, ...inspirationTags.newborn];
      } else if (text.includes('صديق') || text.includes('صداقة')) {
        tags = [...tags, ...inspirationTags.friendship];
      }

      // إضافة تاجز بناءً على الفئة
      if (inspiration.category) {
        tags.push(inspiration.category);
        
        if (inspiration.category.includes('مجوهرات')) {
          tags.push('ذهب', 'فضة', 'خاتم', 'سلسلة', 'أساور');
        } else if (inspiration.category.includes('عطور')) {
          tags.push('عطر', 'رائحة', 'أناقة', 'جمال');
        } else if (inspiration.category.includes('ساعات')) {
          tags.push('ساعة', 'وقت', 'أناقة', 'دقة');
        } else if (inspiration.category.includes('ملابس')) {
          tags.push('موضة', 'أناقة', 'ستايل', 'ملبس');
        }
      }

      // إزالة التكرارات
      tags = [...new Set(tags)];

      // تحديث الإلهام
      await prisma.inspiration.update({
        where: { id: inspiration.id },
        data: {
          content: content,
          tags: tags
        }
      });

      console.log(`✅ تم تحديث الإلهام: ${inspiration.name}`);
    }

    console.log('🎉 تم تحديث جميع الإلهامات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تحديث الإلهامات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// تشغيل التحديث
updateInspirations();
