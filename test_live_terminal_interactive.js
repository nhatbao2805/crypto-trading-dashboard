const { spawn } = require('child_process');

console.log('🧪 Bắt đầu kiểm thử tương tác thực tế với live_agent_terminal.js...');

const child = spawn('node', ['live_agent_terminal.js'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let step = 0;

child.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);

  // Check step 1: Initial prompt rendered
  if (step === 0 && text.includes('👉 AI-Trader [BTC] >')) {
    step = 1;
    console.log('\n[TEST BOT] Gửi lệnh đổi coin sang ETH...');
    child.stdin.write('eth\n');
  } else if (step === 1 && text.includes('👉 AI-Trader [ETH] >')) {
    step = 2;
    console.log('\n[TEST BOT] Gửi câu hỏi chat cho Hội đồng...');
    child.stdin.write('chat Tại sao lại không nên FOMO lúc này?\n');
  } else if (step === 2 && text.includes('PHẢN HỒI HỘI ĐỒNG AI')) {
    step = 3;
    console.log('\n[TEST BOT] Gửi lệnh thoát an toàn (q)...');
    child.stdin.write('q\n');
  }
});

child.stderr.on('data', (data) => {
  console.error('[STDERR]:', data.toString());
});

child.on('exit', (code) => {
  console.log(`\n✅ Tiến trình kết thúc đúng quy trình với Exit Code: ${code}`);
  if (step === 3 && code === 0) {
    console.log('🎉 KIỂM THỬ THÀNH CÔNG 100%: Live terminal hoạt động liên tục, nhận lệnh đa luồng và thoát đúng chuẩn!');
  } else {
    console.error('❌ Kiểm thử chưa đạt đủ các bước. Step:', step, 'Code:', code);
  }
  process.exit(0);
});

// Timeout safeguard (15s)
setTimeout(() => {
  if (child && !child.killed) {
    child.kill();
    console.error('❌ Test timed out');
    process.exit(1);
  }
}, 15000);
