// Central database service exports
export { BaseService } from './base.js'
export { ProfileService } from './profiles.js'
export { PetService } from './pets.js'
export { FoodProductService } from './food-products.js'
export { ScanHistoryService } from './scan-history.js'
export { ChatService } from './chat.js'
export { ComparisonService } from './comparisons.js'

// Import classes for instantiation
import { ProfileService } from './profiles.js'
import { PetService } from './pets.js'
import { FoodProductService } from './food-products.js'
import { ScanHistoryService } from './scan-history.js'
import { ChatService } from './chat.js'
import { ComparisonService } from './comparisons.js'

// Create service instances
export const profileService = new ProfileService()
export const petService = new PetService()
export const foodProductService = new FoodProductService()
export const scanHistoryService = new ScanHistoryService()
export const chatService = new ChatService()
export const comparisonService = new ComparisonService()