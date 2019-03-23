import RealStateAgencyContract from "../../build/contracts/RealStateAgency.json";
import contract from "truffle-contract";

export default async(provider) => {
    const agency = contract(RealStateAgencyContract);
    agency.setProvider(provider);

    let instance = await agency.deployed();
    return instance;
}