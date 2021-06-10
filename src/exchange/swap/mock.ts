import { BigNumber } from "bignumber.js";
import type {
  Exchange,
  ExchangeRate,
  GetMultipleStatus,
  GetProviders,
  SwapRequestEvent,
} from "./types";
import { getAccountUnit } from "../../account";
import type { Transaction } from "../../types";
import { formatCurrencyUnit } from "../../currencies";
import {
  SwapExchangeRateAmountTooLow,
  SwapExchangeRateAmountTooHigh,
} from "../../errors";
import { Observable, of } from "rxjs";

export const mockGetExchangeRates = async (
  exchange: Exchange,
  transaction: Transaction
): Promise<(ExchangeRate & { expirationDate?: Date })[]> => {
  const { fromAccount, toAccount } = exchange;
  const amount = transaction.amount;
  const unitFrom = getAccountUnit(fromAccount);
  const unitTo = getAccountUnit(toAccount);
  const tenPowMagnitude = new BigNumber(10).pow(unitFrom.magnitude);
  const amountFrom = amount.div(tenPowMagnitude);
  const minAmountFrom = new BigNumber(0.0001);
  const maxAmountFrom = new BigNumber(1000);

  if (amountFrom.lte(minAmountFrom)) {
    throw new SwapExchangeRateAmountTooLow(null, {
      minAmountFromFormatted: formatCurrencyUnit(
        unitFrom,
        new BigNumber(minAmountFrom).times(tenPowMagnitude),
        {
          alwaysShowSign: false,
          disableRounding: true,
          showCode: true,
        }
      ),
    });
  }

  if (amountFrom.gte(maxAmountFrom)) {
    throw new SwapExchangeRateAmountTooHigh(null, {
      maxAmountFromFormatted: formatCurrencyUnit(
        unitFrom,
        new BigNumber(maxAmountFrom).times(tenPowMagnitude),
        {
          alwaysShowSign: false,
          disableRounding: true,
          showCode: true,
        }
      ),
    });
  }

  //Fake delay to show loading UI
  await new Promise((r) => setTimeout(r, 800));
  const magnitudeAwareRate = new BigNumber(1)
    .div(new BigNumber(10).pow(unitFrom.magnitude))
    .times(new BigNumber(10).pow(unitTo.magnitude));
  //Mock OK, not really magnitude aware
  return [
    {
      rate: new BigNumber("1"),
      toAmount: amount.times(magnitudeAwareRate),
      magnitudeAwareRate,
      rateId: "mockedRateId",
      provider: "changelly",
      expirationDate: new Date(),
      tradeMethod: "fixed",
    },
    {
      rate: new BigNumber("1"),
      toAmount: amount.times(magnitudeAwareRate),
      magnitudeAwareRate,
      rateId: "mockedRateId",
      provider: "changelly",
      expirationDate: new Date(),
      tradeMethod: "float",
    },
  ];
};
export const mockInitSwap = (
  exchange: Exchange,
  exchangeRate: ExchangeRate,
  transaction: Transaction
): Observable<SwapRequestEvent> => {
  return of({
    type: "init-swap-result",
    initSwapResult: {
      transaction,
      swapId: "mockedSwapId",
    },
  });
};
export const mockGetProviders: GetProviders = async () => {
  //Fake delay to show loading UI
  await new Promise((r) => setTimeout(r, 800));
  return [
    {
      provider: "changelly",
      supportedCurrencies: [
        "bitcoin",
        "litecoin",
        "ethereum",
        "tron",
        "ethereum/erc20/omg",
        "ethereum/erc20/0x_project",
        "ethereum/erc20/augur",
      ],
      tradeMethod: "fixed",
    },
    {
      provider: "changelly",
      supportedCurrencies: [
        "bitcoin",
        "litecoin",
        "ethereum",
        "tron",
        "ethereum/erc20/omg",
        "ethereum/erc20/0x_project",
        "ethereum/erc20/augur",
      ],
      tradeMethod: "float",
    },
  ];
};
export const mockGetStatus: GetMultipleStatus = async (statusList) => {
  //Fake delay to show loading UI
  await new Promise((r) => setTimeout(r, 800));
  return statusList.map((s) => ({ ...s, status: "finished" }));
};