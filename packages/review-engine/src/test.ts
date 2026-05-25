import { runReviewPipeline } from './pipeline'

async function main() {
  const result =
    await runReviewPipeline(
      'C:/work/backend',
      'main',
    )

  console.log(
    JSON.stringify(result, null, 2),
  )
}

main()