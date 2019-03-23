const RealStateAgency = artifacts.require('RealStateAgency');

let instance;

beforeEach(async () => {
    instance = await RealStateAgency.new();
});

contract('RealStateAgency', accounts => {
    it('should have available flats', async () => {
        let total = await instance.getTotalFlats();
        assert(total > 0);
    });

    it('should allow renters to rent a flat providing its deposit', async () => {
        let flat = await instance.flats(0);
        const flatId = flat[0],
            flatName = flat[1],
            flatPrice = flat[2],
            flatDepositNumber = flat[3],
            flatIsRented = flat[4];

        await instance.rentFlat(1, 'Renter Name', { from: accounts[4], value: flatPrice * flatDepositNumber });
        let rentedFlat = await instance.rentedFlats(accounts[4]);

        assert(rentedFlat[0], flatId);
        assert(rentedFlat[1], flatName);
        assert(rentedFlat[2], flatPrice);
        assert(rentedFlat[3], flatDepositNumber);
        assert(rentedFlat[4], !flatIsRented);
    });

    it('should not allow renters to rent a flat providing less', async () => {
        let flat = await instance.flats(0);
        const flatId = flat[0],
            flatPrice = flat[2] - 1000;

        try {
            await instance.rentFlat(flatId, 'Renter Name', { from: accounts[1], value: flatPrice * flatDepositNumber });
        }
        catch (e) { return; }
        assert.fail();
    });
});