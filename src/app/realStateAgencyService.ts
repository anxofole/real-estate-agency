export class RealStateAgencyService {
    contract: any;
    constructor(contract) {
        this.contract = contract;
    }

    async rentFlat(flatId: number, renterName: string, from: string, value: number) {
        return this.contract.rentFlat(flatId, renterName, { from, value });
    }

    async getFlats() {
        const totalFlats = await this.contract.getTotalFlats();
        const flats = [];
        for (let i = 0; i < totalFlats; i++) {
            const flat = await this.contract.flats(i);
            flats.push(flat);
        }

        return this.mapFlats(flats);
    }

    async getTotalFlats() {
        return (await this.contract.getTotalFlats()).toNumber();
    }

    async getRenterFlat(account) {
        const renterFlat = await this.contract.rentedFlats(account);

        return this.mapFlats([renterFlat])[0];
    }

    async getRenterData(account) {
        const renter = await this.contract.renters(account);
        return renter;
    }

    async getRealStateBalance() {
        return (await this.contract.getRealStateBalance()).toNumber();
    }

    async getAccountBalance(from) {
        return (await this.contract.getAccountBalance({from})).toNumber();
    }


    async payRent(from, value) {
        return this.contract.payRent({ from, value });
    }

    async finishRent(flatId, from) {
        return this.contract.finishRent(flatId, { from });
    }

    async isOwner(from) {
        return this.contract.accountIsOwner({ from });
    }

    async transferEarnings(from) {
        return this.contract.transferEarnings({ from });
    }

    mapFlats(flats) {
        return flats.map(flat => {
            return {
                id: flat[0],
                name: flat[1],
                price: flat[2].toNumber(),
                depositNumberRequired: flat[3].toNumber(),
                isRented: flat[4]

            }
        });
    }
}