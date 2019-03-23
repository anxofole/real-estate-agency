import { Component, Inject, OnInit } from '@angular/core';
import { ToastrManager } from 'ng6-toastr-notifications';
import { WEB3 } from './web3';
import Web3 from 'web3';
import RealStateAgencyContract from './realStateAgency';
import { RealStateAgencyService } from './realStateAgencyService';

const converter = (web3: any) => {
  return (value: any) => {
    return web3.utils.fromWei(value.toString(), 'ether');
  };
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  private agency: any;
  private agencyService: RealStateAgencyService;
  public currentAccount: string;
  public totalFlats: number;
  public realStateBalance: number;
  public accountBalance: number;
  public currentAccountIsOwner: boolean;
  public allFlats: Flat[];
  public allFlatsRented: Flat[];
  public renterName: string;
  public rentedFlat: Flat = {
    id: 0,
    name: '',
    price: 0,
    depositNumberRequired: 0,
    isRented: false
  };

  constructor(
    @Inject(WEB3) private web3: Web3,
    public toastr: ToastrManager
  ) { }

  public async ngOnInit() {
    this.agency = await RealStateAgencyContract(this.web3.currentProvider);
    this.agencyService = new RealStateAgencyService(this.agency);
    this.currentAccount = (await this.web3.eth.getAccounts())[0];

    this.watchIfAccountChange();
    this.manageEventsToasters();
    await this.load();
  }

  public async load() {
    this.getFlats();
    this.getTotalFlats();
    this.getRenterFlat();
    this.getAccountBalance();
    this.getRealStateBalance();
    this.getRenterData();
    this.currentAccountIsOwner = await this.isOwner();
  }

  public toEther(wei: number): number {
    return converter(this.web3)(wei);
  }

  public async rentFlat(flat: Flat, renterName: string) {
    const price = flat.price * flat.depositNumberRequired;
    await this.agencyService.rentFlat(flat.id, renterName, this.currentAccount, price);
    await this.load();
  }

  public async getFlats() {
    this.allFlats = (await this.agencyService.getFlats()).filter((flat) => !flat.isRented);
    this.allFlatsRented = (await this.agencyService.getFlats()).filter((flat) => flat.isRented);
  }

  public async getTotalFlats() {
    return await this.agencyService.getTotalFlats();
  }

  public async getRenterFlat() {
    this.rentedFlat = await this.agencyService.getRenterFlat(this.currentAccount);
  }

  public async getRenterData() {
    this.renterName = await this.agencyService.getRenterData(this.currentAccount);
  }

  public async getRealStateBalance() {
    this.realStateBalance = this.toEther(await this.agencyService.getRealStateBalance());
  }

  public async getAccountBalance() {
    this.accountBalance = this.toEther(await this.agencyService.getAccountBalance(this.currentAccount));
  }

  public async payRent(rent: number) {
    await this.agencyService.payRent(this.currentAccount, rent);
    await this.load();
  }

  public async finishRent(flatId: number) {
    await this.agencyService.finishRent(flatId, this.currentAccount);
    await this.load();
  }

  public async isOwner() {
    return await this.agencyService.isOwner(this.currentAccount);
  }

  public async transferEarnings() {
    await this.agencyService.transferEarnings(this.currentAccount);
    await this.load();
  }

  private manageEventsToasters() {
    this.agency.allEvents((error, event) => {
      if (error) {
        this.toastr.errorToastr(`Error: ${error}`);
        return;
      }
      const eventName = event.event;
      const name = event.args.name;
      const price = event.args.price;
      this.toastr.successToastr(`${name} - ${this.toEther(price)} ether`, eventName);
    });
  }

  private watchIfAccountChange() {
    setInterval(async () => {
      const oldAccount = this.currentAccount;
      this.currentAccount = (await this.web3.eth.getAccounts())[0];
      if (oldAccount !== this.currentAccount) {
        await this.load();
      }
    }, 1000);
  }
}

export interface Flat {
  id: number;
  name: string;
  price: number;
  depositNumberRequired: number;
  isRented: boolean;
}
