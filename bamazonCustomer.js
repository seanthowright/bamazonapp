let mysql = require("mysql");
let inquirer = require("inquirer");
let Table = require("cli-table");

//Establish connection to localhost
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    //Use your own password below
    password: " ",
    database: "bamazon"
});

//Create display table in bash
function displayItems() {
    connection.query('SELECT * FROM products', function(error, response) {
        if (error) throw error;
        console.log("Welcome to Bamazon! Brime members get 0% off there next purchase!")
        //Uses cli-table to display table from database
        let productTable = new Table({
            head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity'],
            colWidths: [10, 25, 18, 10, 18]
        });
        //Loops throught the data, then pushes it into the display table
        for (i = 0; i < response.length; i++) {
            productTable.push(
                [response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]
            );
        }
        console.log(productTable.toString());
        inquireForPurchase();
    });
};

//Creates prompts using inquirer to define what and how much are to be purchased
function inquireForPurchase() {
    inquirer.prompt([

        {
            name: "ID",
            type: "input",
            message: "Enter the item's id# that you wish to purchase."
        }, {
            name: 'quantity',
            type: 'input',
            message: "Enter the quantity you would like to purchase."
        },

        // After receiving inputs from prompts, stores them in variables, then passes them to the purchasing function
    ]).then(function(answers) {
        let amountForPurchase = answers.quantity;
        let inquireId = answers.ID;
        purchaseFromDatabase(inquireId, amountForPurchase);
    });

};

//Creates the purchasing functionallity, linking prompt inputs to database
function purchaseFromDatabase(purchaseId, amountPurchased) {
    connection.query('SELECT * FROM products WHERE item_id = ' + purchaseId, function(error, response) {
        if (error) throw error;
        //Sets if amount to be purchased is available, the sale will continue
        if (amountPurchased <= response[0].stock_quantity) {
            let totalCost = response[0].price * amountPurchased;

            console.log("The total for " + amountPurchased + " " + response[0].product_name + " comes to " + totalCost + ". Thank you, come again!");
            //Updates the stock in the database
            connection.query('UPDATE products SET stock_quantity = stock_quantity - ' + amountPurchased + 'WHERE item_id = ' + purchaseId);
            //If the amount wanted is more than the stock available
        } else {
            console.log("We don't currently have enough " + response[0].product_name + " in stock to facilitate your order.");
        };
        //Redisplay shopping window
        displayItems();
    });

};

displayItems();