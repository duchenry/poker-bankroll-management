import { Session } from "../store/sessionStore";

export function calculateTotalBankroll(sessions: Session[]) {
  return sessions.reduce((sum, s) => sum + s.profit, 0);
}

export function calculateROI(sessions: Session[]) {
  const totalBuyIn = sessions.reduce((sum, s) => sum + s.buy_in, 0);
  const totalCashOut = sessions.reduce((sum, s) => sum + s.cash_out, 0);
  if (totalBuyIn === 0) return 0;
  return ((totalCashOut - totalBuyIn) / totalBuyIn) * 100;
}

export function calculateWinrate(sessions: Session[]) {
  const totalProfit = sessions.reduce((sum, s) => sum + s.profit, 0);
  const totalHours = sessions.reduce((sum, s) => sum + s.duration, 0);
  if (totalHours === 0) return 0;
  return totalProfit / totalHours;
}
