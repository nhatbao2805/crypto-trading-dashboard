/**
 * Base Class for all Multi-Agent AI Trader Sub-Agents
 */
class BaseAgent {
  constructor(id, name, avatar, roleDescription) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.roleDescription = roleDescription;
  }

  formatPrice(p) {
    const val = Number(p) || 0;
    if (val >= 1000) {
      return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${val.toFixed(4)}`;
  }

  async analyze(coin, liveMarket) {
    throw new Error(`analyze() method must be implemented by SubAgent ${this.name}`);
  }
}

module.exports = BaseAgent;
