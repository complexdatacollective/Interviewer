const { defineSupportCode } = require('cucumber');
const { By, until } = require('selenium-webdriver');

defineSupportCode(({ Then, When }) => {
  When('User drops a Node from the Bucket onto the Sociogram', function (done) {
    // Write code here that turns the phrase above into concrete actions
    console.log('ran me');
    this.driver.get('http://www.google.com/ncr');
    this.driver.findElement(By.name('q')).sendKeys('webdriver');
    this.driver.findElement(By.name('btnG')).click();
    this.driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    this.driver.quit();
    done(null, 'pending');
  });

  Then(
    'Node should be positioned on the Sociogram',
    (done) => {
      done(null, 'pending');
    }
  );
});
