import { readFileSync } from 'fs';
import { join } from 'path';

export default function Page() {
  const body1 = readFileSync(join(process.cwd(), 'public', 'body1.html'), 'utf-8');
  const body2 = readFileSync(join(process.cwd(), 'public', 'body2.html'), 'utf-8');
  const body3 = readFileSync(join(process.cwd(), 'public', 'body3.html'), 'utf-8');

  return (
    <>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: body1 + body2 + body3 }} />
      {/* eslint-disable @next/next/no-sync-scripts */}
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
      <script src="/app1.js"></script>
      <script src="/app2.js"></script>
      <script src="/app3.js"></script>
      <script src="/app4.js"></script>
      <script src="/app5.js"></script>
      <script src="/app6.js"></script>
      {/* eslint-enable @next/next/no-sync-scripts */}
    </>
  );
}
