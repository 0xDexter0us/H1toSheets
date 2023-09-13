function fetchH1Earnings() {
    var urlEarnings = 'https://api.hackerone.com/v1/hackers/payments/earnings?page%5Bnumber%5D=1&page%5Bsize%5D=100';
    var username = '<Your-HackerOne-Username>';
    var apikey = '<Your-Hackerone-APIKEY>';
    var options = {
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(username + ':' + apikey)
      }
    };
  
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.clear();
    
    var headers = ['Date', 'Handle','Report ID' , 'Report Title', 'Awarded Amount', 'Awarded Bonus Amount', 'Retest Amount', 'Total Amount'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  
    // Fetch all pages of earnings data
    do {
      var responseEarnings = UrlFetchApp.fetch(urlEarnings, options);
      var dataEarnings = JSON.parse(responseEarnings.getContentText());
      
      dataEarnings['data'].map(function(item) {
      var date = Utilities.formatDate(new Date(item['attributes']['created_at']), Session.getScriptTimeZone(), "dd/MM/yyyy");
      var handle = item['relationships']['program']['data']['attributes']['handle'];
    
      var awardedAmount, awardedBonusAmount, retestAmount, totalAmount, id, title;
      if (item['type'] == 'earning-bounty-earned') {
        awardedAmount = item['relationships']['bounty']['data']['attributes']['awarded_amount'];
        awardedBonusAmount = item['relationships']['bounty']['data']['attributes']['awarded_bonus_amount'];
        totalAmount = parseFloat(awardedAmount) + parseFloat(awardedBonusAmount);
        id = item['relationships']['bounty']['data']['relationships']['report']['data']['id'];
        title = item['relationships']['bounty']['data']['relationships']['report']['data']['attributes']['title'];
      } else if (item['type'] == 'earning-retest-completed') {
        retestAmount = item['attributes']['amount'];
        awardedAmount = "0.00"
        awardedBonusAmount = "0.00";
        totalAmount = parseFloat(awardedAmount) + parseFloat(awardedBonusAmount) + parseFloat(retestAmount);
        id = item['relationships']['report_retest_user']['data']['relationships']['report_retest']['data']['relationships']['report']['data']['id'];
        title = item['relationships']['report_retest_user']['data']['relationships']['report_retest']['data']['relationships']['report']['data']['attributes']['title'];
      }

    // Append the data to the next row
      sheet.appendRow([date, handle,id, title, awardedAmount, awardedBonusAmount, retestAmount, totalAmount]);
    })
      // Get the next page URL for earnings
      urlEarnings = dataEarnings['links'] ? dataEarnings['links']['next'] : null;
      
    } while (urlEarnings);
  }
