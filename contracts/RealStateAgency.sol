pragma solidity ^0.4.24;
import './Ownable.sol';

contract RealStateAgency is Ownable{
    
    struct Flat {
        uint id;
        string name;
        uint price;
        uint depositNumberRequired;
        bool isRented;
    }
    
    struct Renter {
        string name;
    }
    
    Flat[] public flats;
    mapping(address => Renter) public renters;
    mapping(address => Flat) public rentedFlats;
    mapping(uint => address) public addressesByFlat;

    
    event FlatRented(string name, uint price);
    event RentPayed(string name, uint price);
    event FinishRent(string name, uint price);
    event EmptyEarnings(string name, uint price);

    
    constructor() public {
        flats.push(Flat(1,'Pozas 20', 4 ether, 2, false));
        flats.push(Flat(2,'Gran Via 51', 5 ether, 2, false));
        flats.push(Flat(3,'San Francisco 16', 1 ether, 1, false));
        flats.push(Flat(4,'Ledesma 10bis', 4 ether, 2, false ));
        flats.push(Flat(5,'Uriortu 5', 2 ether, 1, false));
    }
    
    function rentFlat(uint flatId, string name) public payable {
        require(owner != msg.sender);
             
        for(uint i = 0; i < flats.length; i++){
            if(flats[i].id == flatId){
                Flat storage flat = flats[i];
            }
        }
        
        require(rentedFlats[msg.sender].id == 0);
        require(msg.value == (flat.price * flat.depositNumberRequired));
        
        require(!flat.isRented);

        Renter storage renter = renters[msg.sender];
        addressesByFlat[flat.id] = msg.sender;
        renter.name = name;
        flat.isRented = true;
        rentedFlats[msg.sender] = flat;
        
        emit FlatRented(name, flat.price);
    }
    
    function payRent() public payable {
        Flat memory flat = rentedFlats[msg.sender];
        require(flat.isRented);
        require(flat.price == msg.value);

        Renter memory renter = renters[msg.sender];

        emit RentPayed(renter.name, flat.price);
    }
    
    function getRealStateBalance() public isOwner view returns (uint) {
        address realStateAddress = this;
        return realStateAddress.balance;
    }

    function getAccountBalance() public view returns (uint) {
        return msg.sender.balance;
    }
    
    function finishRent(uint flatId) public isOwner {
        address renterAddress = addressesByFlat[flatId];
        Flat memory rentedFlat = rentedFlats[renterAddress];
        require(rentedFlat.isRented);
        
        Renter memory renter = renters[renterAddress];
        
        for(uint i = 0; i < flats.length; i++){
            if(flats[i].id == rentedFlat.id){
                Flat storage flat = flats[i];
                flat.isRented = false;
            }
        }
      
        uint etherToRefund = rentedFlat.depositNumberRequired * rentedFlat.price;
        renterAddress.transfer(etherToRefund);
        
        emit FinishRent(renter.name, flat.price);
        
        delete rentedFlats[renterAddress];
        delete addressesByFlat[flatId]; 
    } 
    
    function transferEarnings() public isOwner{
        address realStateAddress = this;
        owner.transfer(realStateAddress.balance);
        emit EmptyEarnings('Balance de contrato', realStateAddress.balance);
    }

    function accountIsOwner() public view returns (bool){
        return msg.sender == owner;
    }

    function getTotalFlats() public view returns (uint) {
        return flats.length;
    }
        
  
  }
