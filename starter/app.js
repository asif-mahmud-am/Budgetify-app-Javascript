var budgetController = (function () {

    var Expense = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    }
    var Income = function (id, description, value) {

        this.id = id;
        this.description = description;
        this.value = value;

    }


    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {

            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else {
            this.percentage = -1;
        }

    }

    Expense.prototype.getPercentage = function () {

        return this.percentage;
    }


    var calculateTotal = function (type) {

        var sum = 0;

        data.allItems[type].forEach(function (cur) {

            sum += cur.value;


        });

        data.totals[type] = sum;



    };

    var data = {

        allItems: {

            exp: [],
            inc: []

        },

        totals: {
            exp: 0,
            inc: 0

        },
        budget: 0,
        percentage: -1

    };

    return {

        addItem: function (type, des, val) {

            var newItem;

            //create new ID
            if ((data.allItems[type].length) > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                ID = 0;
            }




            //create new item based on inc or exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);

            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);

            }

            //add new Item
            data.allItems[type].push(newItem);

            //return item

            return newItem;
        },

        deleteItem: function (type, id) {

            var ids, index;

            ids = data.allItems[type].map(function (current) {

                return current.id;

            });

            index = ids.indexOf(id);

            if (index !== -1) {

                data.allItems[type].splice(index, 1);
            }



        },

        calculateBudget: function () {
            //1. calculate total income or expense
            calculateTotal('inc');
            calculateTotal('exp');


            //2. calculate budget inc - exp
            data.budget = data.totals.inc - data.totals.exp;



            //3. calculate percentage 

            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);


        },

        calculatePercentage: function () {

            data.allItems.exp.forEach(function (cur) {

                cur.calcPercentage(data.totals.inc);

            });


        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(function (cur) {

                return cur.getPercentage();

            });

            return allPerc;
        },


        getBudget: function () {

            return {

                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage

            };


        },


        testing: function () {

            console.log(data);

        }


    };





})();


var UIcontroller = (function () {


    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        addItem: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        viewPercentage: '.item__percentage',
        yearLabel: '.budget__title--month'


    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec;


        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {

            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }



        dec = numSplit[1];


        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


    };

    var nodeListForeach = function (list, callback) {

        for (var i = 0; i < list.length; i++) {

            callback(list[i], i);
        }


    };



    return {

        getInput: function () {

            return {

                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)


            };

        },

        addListItem: function (obj, type) {

            var element;

            //1. add HTML element with placeholder text

            if (type === 'inc') {

                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {

                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }


            //2. replace the placeholder with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));



            //3. Insert the html into DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        clearFields: function () {

            var fields, fieldArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (current, index, array) {

                current.value = "";

            });

            fieldArr[0].focus();


        },

        displayBudget: function (obj) {

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {

                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }


        },

        displayPercentage: function (percentage) {

            var fields = document.querySelectorAll(DOMstrings.viewPercentage);

            nodeListForeach(fields, function (current, index) {

                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }



            });


        },

        removeItem: function (item) {

            var el = document.getElementById(item);

            el.parentNode.removeChild(el);


        },

        getMonth: function () {

            var now, year;

            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            now = new Date();

            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstrings.yearLabel).textContent = months[month] + ' ' + year;


        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);


            nodeListForeach(fields, function (cur) {

                cur.classList.toggle('red-focus');

            });

            document.querySelector(DOMstrings.addItem).classList.toggle('red');

        },

        getDom: function () {

            return DOMstrings;

        }


    }



})();


var Controller = (function (bdgtCtrl, UICtrl) {

    var DOM = UICtrl.getDom();



    var updateBudget = function () {

        //1. Calculate the budget
        bdgtCtrl.calculateBudget();


        //2. return the budget
        var budget = bdgtCtrl.getBudget();


        //3. Display the budget

        UICtrl.displayBudget(budget);


    };

    var updatePercentages = function () {

        //1. calculate the percentage

        bdgtCtrl.calculatePercentage();


        //2. read percentage from budget controller

        var percentage = bdgtCtrl.getPercentages();


        //3. display percentage on UI
        UICtrl.displayPercentage(percentage);


    };


    var CtrlAddItem = function () {

        var newItem, input;
        //1. get the input data
        input = UICtrl.getInput();



        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add Item to budget Controller

            newItem = bdgtCtrl.addItem(input.type, input.description, input.value);



            //3. Add item to UI

            UICtrl.addListItem(newItem, input.type);


            //4. clear the fields
            UICtrl.clearFields();

            //5. calculate and display budget
            updateBudget();


            //6. calculate and update percentages

            updatePercentages();

        }


    };
    var ctrlDeleteItem = function (event) {

        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);

        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        //1. delete the item from budget
        bdgtCtrl.deleteItem(type, ID);


        //2. delete the item from UI
        UICtrl.removeItem(itemID);


        //3. update the budget
        updateBudget();


        //4. update the percentages

        updatePercentages();

    };

    var setUpEventListeners = function () {

        document.querySelector(DOM.addItem).addEventListener('click', CtrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {

                CtrlAddItem();
            }

        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);


    };

    return {

        init: function () {

            UICtrl.getMonth();
            UICtrl.displayBudget({

                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });



            setUpEventListeners();
        }
    }




})(budgetController, UIcontroller);



Controller.init();
