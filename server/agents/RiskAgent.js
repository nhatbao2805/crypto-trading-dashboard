const BaseAgent = require('./BaseAgent');

class RiskAgent extends BaseAgent {
  constructor() {
    super(
      'agent_risk',
      'Agent Guardian (Quản Trị Rủi Ro & Vốn)',
      '🛡️',
      'Chuyên gia tính toán tỷ lệ R:R, điểm cắt lỗ bắt buộc, đòn bẩy an toàn và bảo vệ tài khoản'
    );
  }

  async analyze(coin, liveMarket, technicalView, style = 'SCALPING') {
    const currentPrice = Number(liveMarket.price) || 60000;
    const isBullish = technicalView.signal.includes('BULLISH');
    const isBearish = technicalView.signal.includes('BEARISH');
    const styleUpper = (style || 'SCALPING').toUpperCase();

    let slPct = 0.005; // 0.5% default for scalp
    let tp1Pct = 0.010;
    let tp2Pct = 0.018;
    let maxLev = '10x - 15x';

    if (styleUpper === 'DAY_TRADE') {
      slPct = 0.012; // 1.2%
      tp1Pct = 0.022;
      tp2Pct = 0.035;
      maxLev = '5x - 10x';
    } else if (styleUpper === 'SWING') {
      slPct = 0.025; // 2.5%
      tp1Pct = 0.045;
      tp2Pct = 0.075;
      maxLev = '2x - 3x';
    }

    let slPrice, tpPrice1, tpPrice2;
    if (isBullish) {
      slPrice = Number((currentPrice * (1 - slPct)).toFixed(2));
      tpPrice1 = Number((currentPrice * (1 + tp1Pct)).toFixed(2));
      tpPrice2 = Number((currentPrice * (1 + tp2Pct)).toFixed(2));
    } else {
      slPrice = Number((currentPrice * (1 + slPct)).toFixed(2));
      tpPrice1 = Number((currentPrice * (1 - tp1Pct)).toFixed(2));
      tpPrice2 = Number((currentPrice * (1 - tp2Pct)).toFixed(2));
    }

    const slDistance = Math.abs(currentPrice - slPrice);
    const tpDistance = Math.abs(tpPrice2 - currentPrice);
    const rrRatio = slDistance > 0 ? (tpDistance / slDistance).toFixed(1) : '2.0';

    let riskScore = 4.5;
    let riskLevel = 'TRUNG BÌNH';

    if (Math.abs(Number(liveMarket.change24h) || 0) > 5.0) {
      riskScore = 8.0;
      riskLevel = 'RẤT CAO - BIẾN ĐỘNG MẠNH';
      maxLev = styleUpper === 'SWING' ? '2x' : '3x - 5x';
    } else if (technicalView.estimatedRsi > 70 || technicalView.estimatedRsi < 30) {
      riskScore = 6.5;
      riskLevel = 'CAO - QUÁ MUA/QUÁ BÁN';
    } else {
      riskScore = 3.5;
      riskLevel = 'THẤP - AN TOÀN';
    }

    return {
      agent_id: this.id,
      agent_name: this.name,
      avatar: this.avatar,
      risk_score: riskScore,
      risk_level: riskLevel,
      recommended_max_leverage: maxLev,
      stop_loss: this.formatPrice(slPrice),
      take_profit_1: this.formatPrice(tpPrice1),
      take_profit_2: this.formatPrice(tpPrice2),
      risk_reward_ratio: `1:${rrRatio}`,
      advice: `Ký quỹ tối đa 2% tổng tài sản cho vị thế này. Tuyệt đối không gồng lỗ vượt quá Stop Loss ${this.formatPrice(slPrice)}.`
    };
  }
}

module.exports = new RiskAgent();
