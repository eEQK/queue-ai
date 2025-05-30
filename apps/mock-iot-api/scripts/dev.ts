#!/usr/bin/env bun

/**
 * Development startup script for Mock IoT API
 * Provides easy commands for common development tasks
 */

const command = process.argv[2];

const commands = {
  dev: 'bun --watch src/app.ts',
  start: 'bun src/app.ts',
  test: 'bun src/test-api.ts',
  build: 'bun build src/app.ts --outdir dist',
  check: 'tsc --noEmit'
};

const usage = `
🚀 Mock IoT API Development Script

Usage: bun scripts/dev.ts <command>

Available commands:
  dev    - Start development server with file watching
  start  - Start production server
  test   - Run API endpoint tests
  build  - Build for production
  check  - Run TypeScript type checking

Examples:
  bun scripts/dev.ts dev     # Start development server
  bun scripts/dev.ts test    # Run tests
`;

if (!command || !commands[command]) {
  console.log(usage);
  process.exit(1);
}

console.log(`🔧 Running: ${commands[command]}`);
console.log('─'.repeat(50));

// Import and run the command
const { spawn } = require('child_process');
const [cmd, ...args] = commands[command].split(' ');

const child = spawn(cmd, args, {
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Command failed with exit code ${code}`);
    process.exit(code);
  }
});
