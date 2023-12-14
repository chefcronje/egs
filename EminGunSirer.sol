// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.9.3/contracts/access/Ownable.sol";

interface TraderJoe {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function swapExactTokensForTokens(uint256 amount, uint256 minResult,
        address[] memory tokens, address to, uint256 deadline) external returns (uint[] memory amounts);

}

contract EminGunSirer is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(msg.sender, 10_000_000 * (10 ** 18));
    }
}

contract EminGunSirerSale is Ownable {

    TraderJoe dex;
    ERC20 public token;
    ERC20 public inputToken;

    uint256 public pumpInput;
    uint256 public inputToLP;
    uint256 public swappedInput;

    mapping(address => bool) public boughtPresale;

    uint private constant LP_FACTOR = 9500; // 95% in basis points (parts per 10,000)

    uint private constant MAX_PRICE = 10;
    uint private constant START_PRICE = 1;

    uint private constant MAX_SWAP_IN = 1;

    address private marketingWallet;
    address private devWallet;
    address private moonWallet;

    constructor(TraderJoe _dex, address allowedTradeIn, address marketing, address dev, address moon) {
        dex = _dex;
        token = new EminGunSirer("EminGunSirer", "EGS");
        inputToken = ERC20(allowedTradeIn);
        marketingWallet = marketing;
        devWallet = dev;
        moonWallet = moon;
        pumpInput = 0;
        inputToLP = 0;
    }

    mapping(address => uint256) public lastCallTimestamps;

    modifier onlyOncePerHour() {
        require(block.timestamp >= lastCallTimestamps[msg.sender] + 1 hours, "Can only call once per hour");
        _;
    }

    function remainingSupply() public view returns (uint256 supply) {
        supply = token.balanceOf(address(this));
    }

    function tokensForInput(uint256 input) public view returns (uint256 output) {
        require(input <= MAX_SWAP_IN * (1e18), "swap in is limited");

        uint256 total = token.totalSupply();
        uint256 distributed = total - token.balanceOf(address(this));

        output = ((input * total) / (START_PRICE * total + (MAX_PRICE - START_PRICE) * distributed)) * 1000;
    }

    function getToken(uint256 input) external onlyOncePerHour {

        inputToken.transferFrom(msg.sender, address(this), input);

        // Update the last call timestamp for the caller's wallet
        lastCallTimestamps[msg.sender] = block.timestamp;

        uint256 output = tokensForInput(input);
        uint256 outputForLP = output * LP_FACTOR / 10_000;
        uint256 wantedInputForLP = input * LP_FACTOR / 10_000;

        //send coins to user
        token.transfer(msg.sender, output);

        //add liquidity
        inputToken.approve(address(dex), wantedInputForLP);
        token.approve(address(dex), outputForLP);
        (uint256 amountA, ,) = dex.addLiquidity(address(inputToken), address(token), wantedInputForLP, outputForLP, 0, 0, address(this), block.timestamp + 360000);
        inputToLP += amountA;

        // 5% for vault
        uint256 pump = input - wantedInputForLP;
        inputToken.transfer(address(moonWallet), pump);
        pumpInput += pump;

        uint256 swap = wantedInputForLP - amountA;
        //if pool is below current SC price -> swap rest to "buy back" coin.
        if (swap > 0) {
            swappedInput += swap;
            inputToken.approve(address(dex), swap);
            address[] memory path = new address[](2);
            path[0] = address(inputToken);
            path[1] = address(token);
            dex.swapExactTokensForTokens(swap, 0, path, msg.sender, block.timestamp + 36000);
        }
    }

    function closeSale() external onlyOwner {
        uint256 total = token.totalSupply();
        uint256 distributed = total - token.balanceOf(address(this));

        uint256 marketing = distributed * 300 / 10_000;
        uint256 dev = distributed * 200 / 10_000;

        token.transfer(address(marketingWallet), marketing);
        token.transfer(address(devWallet), dev);
        token.transfer(address(0x000000000000000000000000000000000000dEaD), token.balanceOf(address(this)));
    }
}
