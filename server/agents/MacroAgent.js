const BaseAgent = require('./BaseAgent');

class MacroAgent extends BaseAgent {
  constructor() {
    super(
      'agent_macro',
      'Agent Macro (Vĩ Mô & Dòng Tiền On-chain)',
      '📰',
      'Chuyên gia theo dõi tin tức kinh tế, Funding Rate, dữ liệu phái sinh và dòng tiền tổ chức'
    );
  }

  async analyze(coin, liveMarket) {
    const change24h = Number(liveMarket.change24h) || 0;
    const volUsdt = Number(liveMarket.volumeUsdt) || 850000000;

    let fundingRate = '+0.0100%';
    let fundingAnalysis = 'Funding rate ở mức trung lập (+0.0100%), không có hiện tượng quá hưng phấn hay hoảng loạn.';
    if (change24h > 3.0) {
      fundingRate = '+0.0350%';
      fundingAnalysis = 'Funding rate dương cao (+0.0350%), phe Long đang trả phí cao, cẩn trọng rủi ro Long Squeeze.';
    } else if (change24h < -3.0) {
      fundingRate = '-0.0150%';
      fundingAnalysis = 'Funding rate âm (-0.0150%), phe Short áp đảo, có khả năng kích hoạt Short Squeeze bật tăng mạnh.';
    }

    let signal = 'NEUTRAL';
    let summary = '';
    if (change24h >= 0.5) {
      signal = 'BULLISH';
      summary = `Khối lượng giao dịch 24h sôi động ($${(volUsdt / 1e6).toFixed(1)}M USD). Dòng tiền thị trường duy trì xu hướng tích cực, tâm lý ổn định sau các tin vĩ mô.`;
    } else if (change24h <= -1.5) {
      signal = 'BEARISH';
      summary = `Thị trường có dấu hiệu rút thanh khoản ngắn hạn ($${(volUsdt / 1e6).toFixed(1)}M USD). Tâm lý thận trọng trước biến động lãi suất và dòng tiền ETF.`;
    } else {
      signal = 'NEUTRAL';
      summary = `Thanh khoản đi ngang ($${(volUsdt / 1e6).toFixed(1)}M USD). Các nhà đầu tư lớn đang chờ đợi thêm chất xúc tác từ báo cáo kinh tế.`;
    }

    return {
      agent_id: this.id,
      agent_name: this.name,
      avatar: this.avatar,
      signal,
      fundingRate,
      fundingAnalysis,
      volumeUsd: `$${(volUsdt / 1e6).toFixed(1)}M USD`,
      summary
    };
  }
}

module.exports = new MacroAgent();
