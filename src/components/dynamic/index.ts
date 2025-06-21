// Dynamic imports for large components to improve initial page load performance
// التحميل الديناميكي للمكونات الكبيرة لتحسين أداء تحميل الصفحة الأولي

export { default as GiftBuilderDynamic } from './GiftBuilderDynamic'
export { default as WhatsappHelperDynamic } from './WhatsappHelperDynamic'
export { BotCard, FormattedMessage, BotTypingAnimation } from './ChatBotDynamic'
export {
  ProductSwiper,
  CategoryInspirationGallery,
  SubCategorySwiper,
  CountdownTimer,
  GiftExperience,
  LoadingScreen,
} from './HeavyComponentsDynamic' 