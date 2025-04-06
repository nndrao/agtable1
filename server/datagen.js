// Fixed Income Positions Data Generator
// This script creates a realistic dataset of 10,000 fixed income positions with 200+ columns

import { writeFile } from 'fs/promises';

function generateFixedIncomeData(numPositions = 10000) {
    // Define security types and their related parameters
    const securityTypes = [
      { type: "Corporate Bond", couponType: ["Fixed", "Floating", "Step-Up"], callableFlag: [true, false], hasEmbeddedOption: [true, false], defaultRate: [0.001, 0.05] },
      { type: "Treasury", couponType: ["Fixed"], callableFlag: [false], hasEmbeddedOption: [false], defaultRate: [0, 0.001] },
      { type: "MBS", couponType: ["Fixed", "Floating", "Hybrid"], callableFlag: [false], hasEmbeddedOption: [true], defaultRate: [0.002, 0.04] },
      { type: "Municipal Bond", couponType: ["Fixed", "Zero Coupon"], callableFlag: [true, false], hasEmbeddedOption: [true, false], defaultRate: [0.0005, 0.02] },
      { type: "Sovereign", couponType: ["Fixed", "Inflation-Linked"], callableFlag: [false], hasEmbeddedOption: [false], defaultRate: [0.001, 0.08] },
      { type: "ABS", couponType: ["Fixed", "Floating"], callableFlag: [false], hasEmbeddedOption: [true], defaultRate: [0.003, 0.06] },
      { type: "CMBS", couponType: ["Fixed", "Floating"], callableFlag: [false], hasEmbeddedOption: [true], defaultRate: [0.004, 0.07] }
    ];
  
    // Define sectors
    const sectors = {
      "Corporate Bond": ["Financial", "Energy", "Technology", "Healthcare", "Consumer Staples", "Consumer Discretionary", "Industrials", "Materials", "Telecommunications", "Utilities"],
      "Treasury": ["Government"],
      "MBS": ["Agency", "Non-Agency"],
      "Municipal Bond": ["General Obligation", "Revenue", "Education", "Healthcare", "Transportation", "Housing", "Utilities"],
      "Sovereign": ["Developed Markets", "Emerging Markets"],
      "ABS": ["Auto Loans", "Credit Card", "Student Loans", "Equipment", "Consumer Loans"],
      "CMBS": ["Office", "Retail", "Industrial", "Multifamily", "Hotel", "Mixed-Use"]
    };
  
    // Define credit ratings
    const creditRatings = ["AAA", "AA+", "AA", "AA-", "A+", "A", "A-", "BBB+", "BBB", "BBB-", "BB+", "BB", "BB-", "B+", "B", "B-", "CCC+", "CCC", "CCC-", "CC", "C", "D", "NR"];
  
    // Define currencies
    const currencies = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"];
  
    // Define countries and regions
    const countries = [
      { country: "United States", region: "North America", developmentStatus: "Developed" },
      { country: "United Kingdom", region: "Europe", developmentStatus: "Developed" },
      { country: "Germany", region: "Europe", developmentStatus: "Developed" },
      { country: "France", region: "Europe", developmentStatus: "Developed" },
      { country: "Japan", region: "Asia", developmentStatus: "Developed" },
      { country: "China", region: "Asia", developmentStatus: "Emerging" },
      { country: "Brazil", region: "South America", developmentStatus: "Emerging" },
      { country: "India", region: "Asia", developmentStatus: "Emerging" },
      { country: "Russia", region: "Europe", developmentStatus: "Emerging" },
      { country: "Canada", region: "North America", developmentStatus: "Developed" },
      { country: "Australia", region: "Oceania", developmentStatus: "Developed" },
      { country: "Switzerland", region: "Europe", developmentStatus: "Developed" },
      { country: "Mexico", region: "North America", developmentStatus: "Emerging" },
      { country: "South Korea", region: "Asia", developmentStatus: "Developed" },
      { country: "South Africa", region: "Africa", developmentStatus: "Emerging" }
    ];
  
    // Define issuers
    const issuers = [
      { name: "US Treasury", type: "Treasury", country: "United States" },
      { name: "German Bund", type: "Treasury", country: "Germany" },
      { name: "UK Gilt", type: "Treasury", country: "United Kingdom" },
      { name: "Japan Government", type: "Treasury", country: "Japan" },
      { name: "Fannie Mae", type: "MBS", country: "United States" },
      { name: "Freddie Mac", type: "MBS", country: "United States" },
      { name: "Ginnie Mae", type: "MBS", country: "United States" },
      { name: "JP Morgan Chase", type: "Corporate Bond", country: "United States", sector: "Financial" },
      { name: "Bank of America", type: "Corporate Bond", country: "United States", sector: "Financial" },
      { name: "Citigroup", type: "Corporate Bond", country: "United States", sector: "Financial" },
      { name: "HSBC", type: "Corporate Bond", country: "United Kingdom", sector: "Financial" },
      { name: "Deutsche Bank", type: "Corporate Bond", country: "Germany", sector: "Financial" },
      { name: "Barclays", type: "Corporate Bond", country: "United Kingdom", sector: "Financial" },
      { name: "BNP Paribas", type: "Corporate Bond", country: "France", sector: "Financial" },
      { name: "Apple", type: "Corporate Bond", country: "United States", sector: "Technology" },
      { name: "Microsoft", type: "Corporate Bond", country: "United States", sector: "Technology" },
      { name: "Amazon", type: "Corporate Bond", country: "United States", sector: "Technology" },
      { name: "Alphabet", type: "Corporate Bond", country: "United States", sector: "Technology" },
      { name: "ExxonMobil", type: "Corporate Bond", country: "United States", sector: "Energy" },
      { name: "Shell", type: "Corporate Bond", country: "United Kingdom", sector: "Energy" },
      { name: "BP", type: "Corporate Bond", country: "United Kingdom", sector: "Energy" },
      { name: "Total", type: "Corporate Bond", country: "France", sector: "Energy" },
      { name: "Pfizer", type: "Corporate Bond", country: "United States", sector: "Healthcare" },
      { name: "Johnson & Johnson", type: "Corporate Bond", country: "United States", sector: "Healthcare" },
      { name: "Roche", type: "Corporate Bond", country: "Switzerland", sector: "Healthcare" },
      { name: "Novartis", type: "Corporate Bond", country: "Switzerland", sector: "Healthcare" },
      { name: "Procter & Gamble", type: "Corporate Bond", country: "United States", sector: "Consumer Staples" },
      { name: "Coca-Cola", type: "Corporate Bond", country: "United States", sector: "Consumer Staples" },
      { name: "Unilever", type: "Corporate Bond", country: "United Kingdom", sector: "Consumer Staples" },
      { name: "Nestlé", type: "Corporate Bond", country: "Switzerland", sector: "Consumer Staples" },
      { name: "Toyota", type: "Corporate Bond", country: "Japan", sector: "Consumer Discretionary" },
      { name: "Volkswagen", type: "Corporate Bond", country: "Germany", sector: "Consumer Discretionary" },
      { name: "BMW", type: "Corporate Bond", country: "Germany", sector: "Consumer Discretionary" },
      { name: "General Electric", type: "Corporate Bond", country: "United States", sector: "Industrials" },
      { name: "Siemens", type: "Corporate Bond", country: "Germany", sector: "Industrials" },
      { name: "3M", type: "Corporate Bond", country: "United States", sector: "Industrials" },
      { name: "AT&T", type: "Corporate Bond", country: "United States", sector: "Telecommunications" },
      { name: "Verizon", type: "Corporate Bond", country: "United States", sector: "Telecommunications" },
      { name: "Deutsche Telekom", type: "Corporate Bond", country: "Germany", sector: "Telecommunications" },
      { name: "Duke Energy", type: "Corporate Bond", country: "United States", sector: "Utilities" },
      { name: "Engie", type: "Corporate Bond", country: "France", sector: "Utilities" },
      { name: "Southern Company", type: "Corporate Bond", country: "United States", sector: "Utilities" },
      { name: "New York City", type: "Municipal Bond", country: "United States" },
      { name: "California State", type: "Municipal Bond", country: "United States" },
      { name: "Texas State", type: "Municipal Bond", country: "United States" },
      { name: "Brazil Government", type: "Sovereign", country: "Brazil" },
      { name: "Russia Government", type: "Sovereign", country: "Russia" },
      { name: "India Government", type: "Sovereign", country: "India" },
      { name: "China Government", type: "Sovereign", country: "China" },
      { name: "Mexico Government", type: "Sovereign", country: "Mexico" }
    ];
  
    // Helper functions
    function getRandomElement(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
  
    function getRandomNumber(min, max, decimals = 2) {
      const num = Math.random() * (max - min) + min;
      return Number(num.toFixed(decimals));
    }
  
    function getRandomDate(startYear = 2010, endYear = 2040) {
      const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1; // Simplifying to avoid month-specific day counts
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  
    function getRandomIssuer(securityType) {
      return issuers.filter(issuer => issuer.type === securityType);
    }
  
    function generateCUSIP() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let cusip = '';
      for (let i = 0; i < 9; i++) {
        cusip += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return cusip;
    }
  
    function generateISIN(countryCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let isin = countryCode.slice(0, 2).toUpperCase();
      for (let i = 0; i < 10; i++) {
        isin += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return isin;
    }
  
    function calculateRiskMetrics(securityInfo) {
      // Realistic risk metrics based on security characteristics
      const { maturityYears, couponRate, yieldToMaturity, rating, securityType } = securityInfo;
      
      // Base values that would be realistically related
      let duration = Math.min(maturityYears * 0.8, maturityYears - 0.5);
      if (couponRate < 0.01) duration = maturityYears; // Zero coupon bonds
      
      // Modified duration
      const modifiedDuration = duration / (1 + yieldToMaturity);
      
      // Convexity - higher for longer maturities and lower coupons
      const convexity = (duration * duration) / 100 * (1 + 0.5 * (maturityYears / 30));
      
      // Credit spread based on rating and security type
      let baseSpread = 0;
      if (rating.startsWith('AAA')) baseSpread = getRandomNumber(0.1, 0.3);
      else if (rating.startsWith('AA')) baseSpread = getRandomNumber(0.2, 0.5);
      else if (rating.startsWith('A')) baseSpread = getRandomNumber(0.4, 0.8);
      else if (rating.startsWith('BBB')) baseSpread = getRandomNumber(0.7, 1.5);
      else if (rating.startsWith('BB')) baseSpread = getRandomNumber(1.4, 3.5);
      else if (rating.startsWith('B')) baseSpread = getRandomNumber(3.0, 7.0);
      else if (rating.startsWith('CCC')) baseSpread = getRandomNumber(6.0, 15.0);
      else baseSpread = getRandomNumber(10.0, 20.0);
      
      // Adjust spread based on security type
      if (securityType === "Corporate Bond") baseSpread *= 1.1;
      else if (securityType === "Treasury") baseSpread *= 0.1;
      else if (securityType === "Sovereign" && rating.charAt(0) <= 'B') baseSpread *= 1.3;
      
      const spreadDuration = modifiedDuration * baseSpread / 100;
      
      // Calculate Option Adjusted Spread (OAS) if applicable
      let optionAdjustedSpread = baseSpread;
      if (securityInfo.hasEmbeddedOption) {
        optionAdjustedSpread = baseSpread - getRandomNumber(0.1, 0.5);
      }
      
      // Value at Risk (VaR)
      // Simplified calculation: higher for lower-rated, longer duration securities
      const ratingFactor = rating.startsWith('AAA') ? 0.5 : 
                           rating.startsWith('AA') ? 0.7 :
                           rating.startsWith('A') ? 1.0 :
                           rating.startsWith('BBB') ? 1.5 :
                           rating.startsWith('BB') ? 2.0 :
                           rating.startsWith('B') ? 3.0 : 4.0;
      
      const var95 = modifiedDuration * ratingFactor * 0.01 * securityInfo.marketValue;
      const var99 = var95 * 1.5;
      
      // Expected shortfall (ES) / Conditional VaR
      const expectedShortfall95 = var95 * 1.2;
      const expectedShortfall99 = var99 * 1.2;
      
      // Interest rate shock impacts
      const shock100bpUp = -modifiedDuration * securityInfo.marketValue * 0.01;
      const shock100bpDown = modifiedDuration * securityInfo.marketValue * 0.01;
      
      // Some different PnL metrics
      const dailyPnL = getRandomNumber(-0.005, 0.005) * securityInfo.marketValue;
      const weeklyPnL = dailyPnL * getRandomNumber(3, 7);
      const monthlyPnL = weeklyPnL * getRandomNumber(3, 5);
      const ytdPnL = monthlyPnL * getRandomNumber(1, 12);
      
      return {
        duration,
        modifiedDuration,
        convexity,
        spreadDuration,
        creditSpread: baseSpread,
        optionAdjustedSpread,
        var95,
        var99,
        expectedShortfall95,
        expectedShortfall99,
        shock100bpUp,
        shock100bpDown,
        dailyPnL,
        weeklyPnL,
        monthlyPnL,
        ytdPnL
      };
    }
  
    // Generate positions
    const positions = [];
  
    for (let i = 0; i < numPositions; i++) {
      // Select security type and related attributes
      const securityTypeObj = getRandomElement(securityTypes);
      const securityType = securityTypeObj.type;
      
      // Select issuer based on security type
      const possibleIssuers = getRandomIssuer(securityType);
      const issuer = possibleIssuers.length > 0 ? getRandomElement(possibleIssuers) : { 
        name: `Generic ${securityType} Issuer`, 
        type: securityType, 
        country: getRandomElement(countries).country 
      };
      
      // Determine sector
      let sector;
      if (issuer.sector) {
        sector = issuer.sector;
      } else if (sectors[securityType]) {
        sector = getRandomElement(sectors[securityType]);
      } else {
        sector = "Other";
      }
      
      // Country and region
      const countryObj = countries.find(c => c.country === issuer.country) || getRandomElement(countries);
      
      // Determine rating based on security type and issuer
      let baseRatingIndex;
      if (securityType === "Treasury" && ["United States", "Germany", "United Kingdom", "Canada", "Australia", "Switzerland"].includes(countryObj.country)) {
        baseRatingIndex = 0; // AAA
      } else if (securityType === "Sovereign" && countryObj.developmentStatus === "Developed") {
        baseRatingIndex = Math.floor(Math.random() * 4); // AAA to AA-
      } else if (securityType === "Sovereign" && countryObj.developmentStatus === "Emerging") {
        baseRatingIndex = 3 + Math.floor(Math.random() * 8); // AA- to BB-
      } else if (securityType === "Corporate Bond" && sector === "Financial") {
        baseRatingIndex = 3 + Math.floor(Math.random() * 6); // AA- to BBB-
      } else if (securityType === "MBS" && sector === "Agency") {
        baseRatingIndex = Math.floor(Math.random() * 3); // AAA to AA
      } else {
        baseRatingIndex = Math.floor(Math.random() * creditRatings.length);
      }
      
      // Introduce some rating variability
      const ratingVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      const ratingIndex = Math.max(0, Math.min(creditRatings.length - 1, baseRatingIndex + ratingVariation));
      const rating = creditRatings[ratingIndex];
      
      // Maturity
      const maturityYears = getRandomNumber(
        securityType === "Treasury" ? 1 : 2,
        securityType === "MBS" || securityType === "ABS" ? 30 : 
        securityType === "Treasury" ? 30 : 15,
        1
      );
      
      const issueDate = getRandomDate(2010, 2023);
      const maturityDate = getRandomDate(2024, 2050);
      
      // Coupon and yield information
      const couponType = getRandomElement(securityTypeObj.couponType);
      const couponFrequency = getRandomElement([1, 2, 4, 12]); // Annual, semi-annual, quarterly, monthly
      
      // Base coupon rate on rating and maturity
      let baseCouponRate;
      if (rating.startsWith("AAA")) {
        baseCouponRate = getRandomNumber(0.01, 0.04);
      } else if (rating.startsWith("AA")) {
        baseCouponRate = getRandomNumber(0.015, 0.045);
      } else if (rating.startsWith("A")) {
        baseCouponRate = getRandomNumber(0.02, 0.05);
      } else if (rating.startsWith("BBB")) {
        baseCouponRate = getRandomNumber(0.025, 0.06);
      } else if (rating.startsWith("BB")) {
        baseCouponRate = getRandomNumber(0.035, 0.08);
      } else if (rating.startsWith("B")) {
        baseCouponRate = getRandomNumber(0.05, 0.12);
      } else {
        baseCouponRate = getRandomNumber(0.08, 0.18);
      }
      
      // Adjust for maturity
      baseCouponRate += maturityYears * 0.0005;
      
      // Adjust for security type
      if (securityType === "Treasury") {
        baseCouponRate *= 0.8;
      } else if (securityType === "Corporate Bond") {
        baseCouponRate *= 1.1;
      } else if (securityType === "Sovereign" && countryObj.developmentStatus === "Emerging") {
        baseCouponRate *= 1.3;
      }
      
      const couponRate = couponType === "Zero Coupon" ? 0 : baseCouponRate;
      
      // Yield calculation
      // Base yield is related to coupon rate but with some spread
      const spreadToTreasury = getRandomNumber(0.001, 0.03);
      const yieldToMaturity = couponRate + (Math.random() > 0.5 ? 1 : -1) * getRandomNumber(0, 0.01) + spreadToTreasury;
      
      // Option-related flags
      const callableFlag = getRandomElement(securityTypeObj.callableFlag);
      const putableFlag = Math.random() < 0.1;
      const convertibleFlag = securityType === "Corporate Bond" && Math.random() < 0.1;
      const hasEmbeddedOption = getRandomElement(securityTypeObj.hasEmbeddedOption);
      
      // Market data
      const parValue = getRandomNumber(90, 110, 2);
      const cleanPrice = getRandomNumber(85, 115, 2);
      const dirtyPrice = cleanPrice + getRandomNumber(0, 1, 2);
      
      // Position size randomization
      const faceValue = Math.round(getRandomNumber(100000, 10000000, 0));
      const marketValue = faceValue * cleanPrice / 100;
      const currency = getRandomElement(currencies);
      
      // Security identifiers
      const cusip = generateCUSIP();
      const isin = generateISIN(countryObj.country.slice(0, 2));
      const sedol = ""; // Could generate but leaving empty for simplicity
      const ticker = issuer.name.split(" ")[0].substring(0, 4).toUpperCase();
      
      // Create base position data
      const position = {
        // Identifiers
        positionId: `POS${i.toString().padStart(6, '0')}`,
        cusip,
        isin,
        sedol,
        ticker,
        securityName: `${issuer.name} ${couponRate.toFixed(2)}% ${maturityDate.substring(0, 4)}`,
        
        // Security type information
        securityType,
        couponType,
        convertibleFlag,
        callableFlag,
        putableFlag,
        hasEmbeddedOption,
        
        // Issuer information
        issuer: issuer.name,
        issuerType: issuer.type,
        industry: sector,
        sector,
        subsector: "",
        
        // Geographic information
        country: countryObj.country,
        region: countryObj.region,
        developmentStatus: countryObj.developmentStatus,
        
        // Dates
        issueDate,
        maturityDate,
        settlementDate: getRandomDate(2023, 2024),
        
        // Coupon information
        couponRate,
        couponFrequency,
        dayCountConvention: getRandomElement(["ACT/360", "30/360", "ACT/365", "ACT/ACT"]),
        nextCouponDate: getRandomDate(2024, 2025),
        
        // Rating information
        rating,
        ratingAgency: getRandomElement(["S&P", "Moody's", "Fitch"]),
        investmentGrade: ratingIndex < 10, // BBB- and above is investment grade
        
        // Market data
        cleanPrice,
        dirtyPrice,
        accruedInterest: dirtyPrice - cleanPrice,
        yield: yieldToMaturity,
        yieldToMaturity,
        yieldToWorst: hasEmbeddedOption ? yieldToMaturity - getRandomNumber(0, 0.01) : yieldToMaturity,
        spreadToTreasury,
        zSpread: spreadToTreasury * 100 + getRandomNumber(-10, 10, 0),
        
        // Position data
        currency,
        faceValue,
        parValue,
        marketValue,
        costBasis: marketValue * getRandomNumber(0.9, 1.1, 4),
        unrealizedGainLoss: getRandomNumber(-0.1, 0.1, 4) * marketValue,
        maturityYears,
        
        // Portfolio information
        portfolio: `Portfolio${Math.floor(i / 500) + 1}`, // 20 portfolios with 500 positions each
        strategy: getRandomElement(["Core", "Core Plus", "High Yield", "Emerging Markets", "Total Return", "Income"]),
        accountType: getRandomElement(["Retail", "Institutional", "Pension", "Insurance", "Sovereign Wealth"]),
        benchmark: getRandomElement(["Agg Index", "Treasury Index", "Credit Index", "High Yield Index", "Custom Benchmark"]),
        
        // Default risk
        probabilityOfDefault: getRandomNumber(securityTypeObj.defaultRate[0], securityTypeObj.defaultRate[1], 6),
        lossGivenDefault: getRandomNumber(0.2, 0.8, 2),
        expectedLoss: 0, // Will calculate below
        
        // Liquidity metrics
        bidAskSpread: getRandomNumber(0.001, 0.05, 4),
        averageDailyVolume: Math.round(getRandomNumber(100000, 5000000, 0)),
        liquidityScore: getRandomNumber(1, 10, 1),
        daysToLiquidate: Math.round(getRandomNumber(1, 30, 0)),
        
        // Collateral information (for structured products)
        collateralType: securityType === "MBS" || securityType === "ABS" || securityType === "CMBS" ? 
                        (securityType === "MBS" ? "Residential Mortgages" : 
                         securityType === "ABS" ? getRandomElement(sectors["ABS"]) : 
                         getRandomElement(sectors["CMBS"])) : "",
        subordination: securityType === "MBS" || securityType === "ABS" || securityType === "CMBS" ? 
                      getRandomNumber(0, 30, 1) : 0,
        
        // Trade information
        tradeDate: getRandomDate(2020, 2023),
        traderId: `T${Math.floor(Math.random() * 50) + 1}`,
        traderName: `Trader ${Math.floor(Math.random() * 50) + 1}`,
        broker: getRandomElement(["Goldman Sachs", "JP Morgan", "Morgan Stanley", "Bank of America", "Citigroup", "Barclays", "Credit Suisse", "UBS", "Deutsche Bank"]),
        
        // Compliance information
        restrictedSecurity: Math.random() < 0.05,
        watchlistFlag: Math.random() < 0.1,
        
        // Tax information
        taxStatus: getRandomElement(["Taxable", "Tax-Exempt"]),
        taxLotMethod: getRandomElement(["FIFO", "LIFO", "Highest Cost", "Lowest Cost", "Average Cost"]),
        
        // ESG metrics
        esgScore: Math.round(getRandomNumber(1, 100, 0)),
        environmentalScore: Math.round(getRandomNumber(1, 100, 0)),
        socialScore: Math.round(getRandomNumber(1, 100, 0)),
        governanceScore: Math.round(getRandomNumber(1, 100, 0)),
        
        // Custom classifications
        customCategory1: getRandomElement(["Tier 1", "Tier 2", "Tier 3"]),
        customCategory2: getRandomElement(["Alpha", "Beta", "Gamma", "Delta"]),
        customFlag1: Math.random() < 0.5,
        customFlag2: Math.random() < 0.3,
        customValue1: getRandomNumber(0, 100, 2),
        customValue2: getRandomNumber(0, 1000, 2),
        
        // Timestamp
        lastUpdated: new Date().toISOString()
      };
      
      // Calculate expected loss
      position.expectedLoss = position.probabilityOfDefault * position.lossGivenDefault;
      
      // Risk metrics calculation
      const riskMetrics = calculateRiskMetrics({
        maturityYears: position.maturityYears,
        couponRate: position.couponRate,
        yieldToMaturity: position.yieldToMaturity,
        rating: position.rating,
        securityType: position.securityType,
        hasEmbeddedOption: position.hasEmbeddedOption,
        marketValue: position.marketValue
      });
      
      // Add risk metrics to position
      Object.assign(position, {
        // Duration metrics
        duration: riskMetrics.duration,
        modifiedDuration: riskMetrics.modifiedDuration,
        effectiveDuration: position.hasEmbeddedOption ? riskMetrics.modifiedDuration - getRandomNumber(0.1, 0.5, 2) : riskMetrics.modifiedDuration,
        convexity: riskMetrics.convexity,
        
        // Spread metrics
        spreadDuration: riskMetrics.spreadDuration,
        creditSpread: riskMetrics.creditSpread,
        optionAdjustedSpread: riskMetrics.optionAdjustedSpread,
        
        // Risk metrics
        var95: riskMetrics.var95,
        var99: riskMetrics.var99,
        expectedShortfall95: riskMetrics.expectedShortfall95,
        expectedShortfall99: riskMetrics.expectedShortfall99,
        
        // Scenario analysis
        shock100bpUp: riskMetrics.shock100bpUp,
        shock100bpDown: riskMetrics.shock100bpDown,
        shock50bpUp: riskMetrics.shock100bpUp / 2,
        shock50bpDown: riskMetrics.shock100bpDown / 2,
        shock200bpUp: riskMetrics.shock100bpUp * 2,
        shock200bpDown: riskMetrics.shock100bpDown * 2,
        
        // PnL metrics
        dailyPnL: riskMetrics.dailyPnL,
        weeklyPnL: riskMetrics.weeklyPnL,
        monthlyPnL: riskMetrics.monthlyPnL,
        ytdPnL: riskMetrics.ytdPnL,
  
        // Performance metrics
        totalReturn1M: getRandomNumber(-0.05, 0.05, 4),
        totalReturn3M: getRandomNumber(-0.08, 0.08, 4),
        totalReturn6M: getRandomNumber(-0.12, 0.12, 4),
        totalReturn1Y: getRandomNumber(-0.15, 0.15, 4),
        totalReturnYTD: getRandomNumber(-0.10, 0.10, 4),
        
        // Performance attribution
        incomePnL: getRandomNumber(-0.03, 0.05, 4) * marketValue,
        pricePnL: getRandomNumber(-0.05, 0.05, 4) * marketValue,
        fxPnL: currency !== "USD" ? getRandomNumber(-0.03, 0.03, 4) * marketValue : 0,
        
        // Additional analytics
        macaulayDuration: riskMetrics.duration,
        keyRateDuration1Y: securityType === "Treasury" ? getRandomNumber(0, 0.1, 4) : 0,
        keyRateDuration2Y: securityType === "Treasury" ? getRandomNumber(0, 0.2, 4) : 0,
        keyRateDuration5Y: securityType === "Treasury" ? getRandomNumber(0, 0.5, 4) : 0,
        keyRateDuration10Y: securityType === "Treasury" ? getRandomNumber(0, 0.8, 4) : 0,
        keyRateDuration30Y: securityType === "Treasury" ? getRandomNumber(0, 1, 4) : 0,
        
        // Stress test scenarios
        stressTest1: getRandomNumber(-0.15, 0.05, 4) * marketValue,
        stressTest2: getRandomNumber(-0.25, 0.1, 4) * marketValue,
        stressTest3: getRandomNumber(-0.4, 0.15, 4) * marketValue,
        
        // Prepayment metrics (for MBS)
        CPR: securityType === "MBS" ? getRandomNumber(0, 30, 2) : null,
        PSA: securityType === "MBS" ? getRandomNumber(0, 300, 0) : null,
        WAL: securityType === "MBS" || securityType === "ABS" || securityType === "CMBS" ? getRandomNumber(1, 15, 2) : null,
        
        // Market variables
        benchmarkRate: getRandomNumber(0.01, 0.05, 4),
        libor3M: getRandomNumber(0.01, 0.045, 4),
        libor6M: getRandomNumber(0.015, 0.05, 4),
        swapRate5Y: getRandomNumber(0.02, 0.055, 4),
        swapRate10Y: getRandomNumber(0.025, 0.06, 4),
        
        // Additional identifiers
        bloombergId: `BBG${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        reutersId: `RIC${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        
        // Settlement details
        settlementDays: Math.round(getRandomNumber(1, 3, 0)),
        clearingHouse: getRandomElement(["DTC", "Euroclear", "Clearstream", "JASDEC", "CDS"]),
        
        // Regulatory metrics
        baselRiskWeight: getRandomNumber(0, 150, 0),
        SFTRClass: getRandomElement(["Level 1", "Level 2A", "Level 2B", "Non-HQLA"]),
        MiFIDClass: getRandomElement(["Liquid", "Illiquid"]),
        
        // Additional risk metrics 
        creditVaR: getRandomNumber(0, marketValue * 0.1, 2),
        spreadVaR: getRandomNumber(0, marketValue * 0.08, 2),
        interestRateVaR: getRandomNumber(0, marketValue * 0.07, 2),
        
        // Options data
        optionType: hasEmbeddedOption ? getRandomElement(["Call", "Put", "Both"]) : null,
        optionExerciseType: hasEmbeddedOption ? getRandomElement(["European", "American", "Bermudan"]) : null,
        optionStrike: hasEmbeddedOption ? getRandomNumber(80, 120, 2) : null,
        impliedVolatility: hasEmbeddedOption ? getRandomNumber(0.05, 0.3, 4) : null,
        
        // Instrument specific data
        floatingRateIndex: couponType === "Floating" ? getRandomElement(["LIBOR", "SOFR", "EURIBOR", "SONIA", "TONAR"]) : null,
        floatingRateSpread: couponType === "Floating" ? getRandomNumber(0.001, 0.05, 4) : null,
        
        // Cash flow projection
        nextPaymentAmount: faceValue * couponRate / couponFrequency,
        projectedCashFlow1Y: faceValue * couponRate + (maturityYears <= 1 ? faceValue : 0),
        
        // Counterparty information
        counterpartyName: getRandomElement(["JP Morgan", "Goldman Sachs", "Morgan Stanley", "Citigroup", "Bank of America", "Wells Fargo", "HSBC", "Deutsche Bank", "BNP Paribas"]),
        counterpartyRating: getRandomElement(["AA", "AA-", "A+", "A", "A-"]),
        
        // Model information
        pricingModel: getRandomElement(["Discounted Cash Flow", "Binomial Tree", "Black-Scholes", "Monte Carlo"]),
        modelConfidence: getRandomNumber(0.5, 1, 2),
        lastModelRun: getRandomDate(2024, 2024),
        
        // Additional financial metrics
        currentRatio: getRandomNumber(0.8, 3, 2),
        quickRatio: getRandomNumber(0.5, 2, 2),
        debtEquityRatio: getRandomNumber(0.2, 5, 2),
        interestCoverageRatio: getRandomNumber(1, 10, 2),
        
        // Additional market metrics
        beta: securityType === "Corporate Bond" ? getRandomNumber(0.5, 1.5, 2) : null,
        historicalVolatility30D: getRandomNumber(0.01, 0.2, 4),
        historicalVolatility90D: getRandomNumber(0.01, 0.18, 4),
        sharpeRatio: getRandomNumber(-1, 3, 2),
        informationRatio: getRandomNumber(-1, 2, 2),
        
        // Trading metrics
        turnoverRatio: getRandomNumber(0, 5, 2),
        daysToMaturity: Math.round(maturityYears * 365),
        
        // Credit metrics
        altmanZScore: securityType === "Corporate Bond" ? getRandomNumber(1, 8, 2) : null,
        CDS5Y: securityType === "Corporate Bond" || securityType === "Sovereign" ? riskMetrics.creditSpread * 100 + getRandomNumber(-20, 20, 0) : null,
        
        // Market indicators
        marketSentiment: getRandomElement(["Positive", "Neutral", "Negative"]),
        technicalIndicator: getRandomElement(["Bullish", "Neutral", "Bearish"]),
        
        // Additional custom fields
        customMetric1: getRandomNumber(0, 1, 4),
        customMetric2: getRandomNumber(0, 100, 2),
        customMetric3: getRandomNumber(-1, 1, 4),
        customMetric4: getRandomNumber(-100, 100, 0),
        customMetric5: getRandomNumber(0, 1000, 0),
        
        // Additional risk management fields
        stressScenario1Description: "Global Recession",
        stressScenario2Description: "Interest Rate Spike",
        stressScenario3Description: "Sovereign Default",
        
        // Time series data
        priceHistory30D: Array.from({length: 30}, () => getRandomNumber(cleanPrice * 0.95, cleanPrice * 1.05, 2)),
        volumeHistory30D: Array.from({length: 30}, () => Math.round(getRandomNumber(10000, 1000000, 0))),
        
        // Classification data
        assetClass: "Fixed Income",
        subAssetClass: securityType,
        riskTier: getRandomElement(["Low", "Medium-Low", "Medium", "Medium-High", "High"]),
        
        // Default status
        defaultStatus: rating === "D" ? "Defaulted" : "Performing",
        daysInDefault: rating === "D" ? Math.round(getRandomNumber(1, 365, 0)) : 0,
        recoveryRate: rating === "D" ? getRandomNumber(0.2, 0.6, 2) : null,
        
        // Additional credit analytics
        leverageRatio: securityType === "Corporate Bond" ? getRandomNumber(0.1, 10, 2) : null,
        debtToEBITDA: securityType === "Corporate Bond" ? getRandomNumber(0.5, 8, 2) : null,
        interestCoverage: securityType === "Corporate Bond" ? getRandomNumber(0.5, 15, 2) : null,
        
        // Time-based metrics
        timeToNextCall: callableFlag ? getRandomNumber(0.5, 5, 2) : null,
        timeToNextPut: putableFlag ? getRandomNumber(0.5, 5, 2) : null,
        timeToBenchmark: getRandomNumber(0, 0.2, 4),
        
        // Risk bucketing
        durationBucket: riskMetrics.modifiedDuration < 3 ? "Short" : riskMetrics.modifiedDuration < 7 ? "Intermediate" : "Long",
        qualityBucket: ratingIndex < 3 ? "Ultra High Quality" : 
                      ratingIndex < 6 ? "High Quality" : 
                      ratingIndex < 10 ? "Investment Grade" : 
                      ratingIndex < 16 ? "High Yield" : "Distressed",
                      
        // Scenario Analysis
        inflationShock: getRandomNumber(-0.2, 0.1, 4) * marketValue,
        deflationShock: getRandomNumber(-0.15, 0.2, 4) * marketValue,
        recessionShock: getRandomNumber(-0.3, 0.05, 4) * marketValue,
        
        // Supply chain metrics
        sustainabilityScore: getRandomNumber(0, 100, 0),
        carbonFootprint: getRandomNumber(0, 1000, 0),
        
        // Additional market factors
        correlationToSP500: getRandomNumber(-0.8, 0.8, 2),
        correlationToAggIndex: getRandomNumber(-0.5, 0.95, 2),
        
        // Regional exposure
        northAmericaExposure: countryObj.region === "North America" ? 100 : getRandomNumber(0, 30, 0),
        europeExposure: countryObj.region === "Europe" ? 100 : getRandomNumber(0, 30, 0),
        asiaExposure: countryObj.region === "Asia" ? 100 : getRandomNumber(0, 30, 0),
        emergingMarketsExposure: countryObj.developmentStatus === "Emerging" ? 100 : getRandomNumber(0, 20, 0)
      });
      
      positions.push(position);
    }
    
    return positions;
  }
  
  // Self-invoking async function to generate and save data
  (async () => {
    try {
      // Generate sample dataset
      const fixedIncomeData = generateFixedIncomeData(10000);
      console.log(`Generated ${fixedIncomeData.length} fixed income positions.`);
      
      // Write the full dataset to a file
      await writeFile('./fixedIncomeData.json', JSON.stringify(fixedIncomeData, null, 2));
      console.log('Data file successfully written to fixedIncomeData.json');
    } catch (error) {
      console.error('Error generating or saving data:', error);
    }
  })();
  
  // Export the function for potential reuse in other modules
  export { generateFixedIncomeData };