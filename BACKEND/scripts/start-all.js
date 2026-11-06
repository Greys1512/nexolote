const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const HOST = '127.0.0.1';
const SERVICES = [
  ['catalogo-service', 3001],
  ['produccion-service', 3002],
  ['inventario-service', 3003],
  ['mantenimiento-service', 3004],
  ['auth-service', 3005],
];
const children = [];
let shuttingDown = false;
let shutdownPromise;

function stopAll(exitCode) {
  if (shutdownPromise) return shutdownPromise;
  shuttingDown = true;

  shutdownPromise = (async () => {
    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGTERM');
      }
    }

    const exited = Promise.all(
      children.map(
        (child) =>
          new Promise((resolve) => {
            if (child.exitCode !== null || child.signalCode !== null) {
              resolve();
            } else {
              child.once('exit', resolve);
            }
          }),
      ),
    );
    const timeout = new Promise((resolve) => setTimeout(resolve, 10_000));
    await Promise.race([exited, timeout]);

    for (const child of children) {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
    }

    process.exitCode = exitCode;
  })();

  return shutdownPromise;
}

function startService(name) {
  const entryPoint = path.join(__dirname, '..', 'dist', 'apps', name, 'main.js');
  const child = spawn(process.execPath, [entryPoint], {
    cwd: path.join(__dirname, '..'),
    env: process.env,
    stdio: 'inherit',
  });

  children.push(child);
  child.on('error', (error) => {
    console.error(`No se pudo iniciar ${name}:`, error);
    void stopAll(1);
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(
        `${name} terminó inesperadamente (code=${code}, signal=${signal}).`,
      );
      void stopAll(code || 1);
    }
  });
  return child;
}

function waitForPort(port, service, child) {
  const deadline = Date.now() + 90_000;

  return new Promise((resolve, reject) => {
    const attempt = () => {
      if (child.exitCode !== null || child.signalCode !== null) {
        reject(new Error(`${service} terminó antes de abrir el puerto ${port}.`));
        return;
      }

      const socket = net.createConnection({ host: HOST, port });
      socket.setTimeout(1_000);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('timeout', () => socket.destroy());
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() >= deadline) {
          reject(new Error(`${service} no abrió el puerto ${port} a tiempo.`));
          return;
        }
        setTimeout(attempt, 500);
      });
      socket.once('close', () => {
        if (Date.now() >= deadline && !socket.connecting) {
          reject(new Error(`${service} no abrió el puerto ${port} a tiempo.`));
        }
      });
    };

    attempt();
  });
}

process.on('SIGINT', () => void stopAll(0));
process.on('SIGTERM', () => void stopAll(0));

async function main() {
  const serviceChildren = SERVICES.map(([name]) => startService(name));
  await Promise.all(
    SERVICES.map(([name, port], index) =>
      waitForPort(port, name, serviceChildren[index]),
    ),
  );

  if (!shuttingDown) startService('api-gateway');
}

main().catch((error) => {
  console.error('No se pudieron iniciar los servicios NEXOLOTE:', error);
  void stopAll(1);
});
