import { createHttpServer, createMcpServer } from "./server.js";

function parseArgs(argv: string[]): { port: number; verbose: boolean } {
  let port = 4243;
  let verbose = false;

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--port" && argv[i + 1]) {
      port = Number.parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === "--verbose") {
      verbose = true;
    }
  }

  return { port, verbose };
}

async function main(): Promise<void> {
  const { port, verbose } = parseArgs(process.argv);

  createHttpServer(port, verbose);
  await createMcpServer(verbose);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err}\n`);
  process.exit(1);
});
