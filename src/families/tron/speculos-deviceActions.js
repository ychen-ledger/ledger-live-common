// @flow
import type { DeviceAction } from "../../bot/types";
import { deviceActionFlow } from "../../bot/specs";
import { formatCurrencyUnit } from "../../currencies";
import type { Transaction } from "./types";

function subAccount(subAccountId, account) {
  const sub = (account.subAccounts || []).find((a) => a.id === subAccountId);
  if (!sub || sub.type !== "TokenAccount")
    throw new Error("expected sub account id " + subAccountId);
  return sub;
}

const resourceExpected = ({ transaction: { resource } }) =>
  resource
    ? resource.slice(0, 1).toUpperCase() + resource.slice(1).toLowerCase()
    : "";

const acceptTransaction: DeviceAction<Transaction, *> = deviceActionFlow({
  steps: [
    {
      title: "Review",
      button: "Rr",
      // TODO define expectedValue
    },
    {
      title: "Claim",
      button: "Rr",
    },
    {
      title: "Gain",
      button: "Rr",
      expectedValue: resourceExpected,
    },
    {
      title: "Resource",
      button: "Rr",
      expectedValue: resourceExpected,
    },
    {
      title: "Amount",
      button: "Rr",
      expectedValue: ({ account, status }) =>
        formatCurrencyUnit(
          {
            ...account.unit,
            code: account.currency.deviceTicker || account.unit.code,
          },
          status.amount,
          {
            disableRounding: true,
          }
        ),
    },
    {
      title: "Token",
      button: "Rr",
      expectedValue: ({ account, transaction }) =>
        transaction.subAccountId
          ? subAccount(transaction.subAccountId, account).token.ticker
          : "TRX",
    },
    {
      title: "From Address",
      button: "Rr",
      expectedValue: ({ account }) => account.freshAddress,
    },
    {
      title: "Freeze To",
      button: "Rr",
      expectedValue: ({ account }) => account.freshAddress,
    },
    {
      title: "Delegated To",
      button: "Rr",
      expectedValue: ({ account }) => account.freshAddress,
    },
    {
      title: "Send To",
      button: "Rr",
      expectedValue: ({ transaction }) => transaction.recipient,
    },
    {
      title: "Sign",
      button: "LRlr",
      final: true,
    },
  ],
  fallback: ({ event, transaction }) => {
    if (transaction.mode === "vote") {
      for (const vote of transaction.votes) {
        const title = `${vote.address.slice(0, 5)}...${vote.address.slice(
          vote.address.length - 5
        )}`;
        if (event.text === title) {
          return voteAction(vote, title);
        }
      }
    }
  },
});

function voteAction(vote, title): any {
  return {
    title,
    button: "Rr",
    expectedValue: () => String(vote.voteCount),
  };
}

export default { acceptTransaction };
