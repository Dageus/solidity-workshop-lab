import { expect } from "chai";
import { network } from "hardhat"; 

// Hardhat 3: Explicitly connect to the network object, NOT hre
const { ethers, networkHelpers } = await network.connect();
const { loadFixture } = networkHelpers;

describe("LXBWS Contract", function () {

  async function setup() {
    const ERC20 = await ethers.getContractFactory("LXBWS");
    const [owner, addr1, addr2] = await ethers.getSigners();
    const erc20 = await ERC20.deploy();

    await erc20.waitForDeployment();

    return { erc20, owner, addr1, addr2 };
  };

  it("Should return the correct name and symbol", async function () {
    const { erc20 } = await loadFixture(setup);
    expect(await erc20.name()).to.equal("Lisbon Blockchain Winter School Token");
    expect(await erc20.symbol()).to.equal("LXBWS");
  });

  it("Should approve and check allowance", async function () {
    const { erc20, owner, addr1 } = await loadFixture(setup);

    await erc20.mint(owner.address, 1000); 
    await erc20.connect(owner).approve(addr1.address, 500);

    const allowance = await erc20.allowance(owner.address, addr1.address);
    expect(allowance).to.equal(500n);
  });

  it("Should transfer tokens via transferFrom", async function () {
    const { erc20, owner, addr1, addr2 } = await loadFixture(setup);

    await erc20.mint(owner.address, 1000);
    await erc20.connect(owner).approve(addr1.address, 500);

    await erc20.connect(addr1).transferFrom(owner.address, addr2.address, 300);

    const ownerBalance = await erc20.balanceOf(owner.address);
    const addr2Balance = await erc20.balanceOf(addr2.address);

    expect(ownerBalance).to.equal(700n); 
    expect(addr2Balance).to.equal(300n);
  });

  it("Should decrease allowance after transferFrom", async function () {
    const { erc20, owner, addr1, addr2 } = await loadFixture(setup);

    await erc20.mint(owner.address, 1000);
    await erc20.connect(owner).approve(addr1.address, 500);

    await erc20.connect(addr1).transferFrom(owner.address, addr2.address, 200);

    const remainingAllowance = await erc20.allowance(owner.address, addr1.address);
    expect(remainingAllowance).to.equal(300n); 
  });
});
