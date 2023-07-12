import { GatewayInfo, Federation } from './types';

// GatewayApi is an API to interact with the Gateway server
interface ApiInterface {
  fetchInfo: () => Promise<GatewayInfo>;
  fetchAddress: (federationId: string) => Promise<string>;
  connectFederation: (connectInfo: string) => Promise<Federation>;

  /**
   *  Request a withdrawal from a fedration served by the Gateway
   * @param federationId  id of the federation to withdraw from
   * @param amountSat the amount in satoshis to be withdrawn from the federation
   * @param address the bitcoin address to withdraw to
   * @returns `TransactionId` from the Fedimint federation
   */
  requestWithdrawal: (
    federationId: string,
    amountSat: number,
    address: string
  ) => Promise<string>;
}

// GatewayApi is an implementation of the ApiInterface
export class GatewayApi implements ApiInterface {
  private baseUrl: string | undefined = process.env.REACT_APP_FM_GATEWAY_API;
  private password = process.env.REACT_APP_FM_GATEWAY_PASSWORD || '';

  fetchInfo = async (): Promise<GatewayInfo> => {
    try {
      const res: Response = await fetch(`${this.baseUrl}/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.password}`,
        },
        body: JSON.stringify(null),
      });

      if (res.ok) {
        const info: GatewayInfo = await res.json();
        return Promise.resolve(info);
      }

      throw responseToError('Fetching gateway info', res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  fetchAddress = async (federationId: string): Promise<string> => {
    try {
      const res: Response = await fetch(`${this.baseUrl}/address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.password}`,
        },
        body: JSON.stringify({
          federation_id: federationId,
        }),
      });

      if (res.ok) {
        const address: string = await res.text();
        return Promise.resolve(address);
      }

      throw responseToError('fetching federation address', res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  connectFederation = async (connectInfo: string): Promise<Federation> => {
    try {
      const res: Response = await fetch(`${this.baseUrl}/connect-fed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.password}`,
        },
        body: JSON.stringify({
          connect: connectInfo,
        }),
      });

      if (res.ok) {
        const federation: Federation = await res.json();
        return Promise.resolve(federation);
      }

      throw responseToError('Connecting federation', res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  requestWithdrawal = async (
    federationId: string,
    amountSat: number,
    address: string
  ): Promise<string> => {
    try {
      const res: Response = await fetch(`${this.baseUrl}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.password}`,
        },
        body: JSON.stringify({
          federation_id: federationId,
          amount: amountSat,
          address,
        }),
      });

      if (res.ok) {
        const txid: string = await res.text();
        console.log('txid', txid);
        return Promise.resolve(txid);
      }

      throw responseToError('withdrawing', res);
    } catch (err) {
      return Promise.reject(err);
    }
  };
}

const responseToError = (scenario: string, res: Response): Error => {
  return new Error(
    `${scenario} \nStatus : ${res.status} \nReason : ${res.statusText}\n`
  );
};