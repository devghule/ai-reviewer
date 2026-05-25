import { runAIReview } from './orchestrator'

const diff = `
diff --git a/test.ts b/test.ts
+ const password = '123456'
`

async function main() {
  const result =
    await runAIReview(diff)

  console.log(result)
}

main()