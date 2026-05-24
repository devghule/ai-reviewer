import { ReviewFindingSchema } from './review'

const result = ReviewFindingSchema.safeParse({
  id: '1',
  severity: 'high',
  category: 'security',
  title: 'JWT Token Leak',
  description: 'Sensitive token exposed',
  recommendation: 'Use HTTP-only cookies',
  file: 'AuthController.java',
})

console.log(result.success)