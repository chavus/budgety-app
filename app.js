/* Example
var budgetController = (function(){  // This is a module

    var x = 23;  // Private to outside
    var add = function(a){  // Private to outside
        return a + x;
    };

    return {
        publicTest: function(b){    // Public through assignment and execution
            console.log(add(b));
        }
    }

})();

console.log(budgetController.x); // returns undefined
budgetController.publicTest(5); // returns 28 
*/


// Budget Controller
var budgetController = (function(){  

    var idInc=0;
    var idExp=0;

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = parseFloat(value);
        this.percentage = -1; 
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round(this.value/totalIncome * 100);
        } else {
            this.percentage = -1;
        }
        
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = parseFloat(value);
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
        percentageExp: -1
    };

    function calcTotal(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){    //forEach(function(currentValuem, index))
            sum += current.value
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, desc, val){
            var newItem;
            if (type === 'inc'){
                newItem = new Income(idInc, desc, val);
                idInc++;
            } else if (type === 'exp'){
                newItem = new Expense(idExp, desc, val);
                idExp++;
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                income: data.totals.inc,
                expense: data.totals.exp,
                percentageExp: data.percentageExp
            }
        },

        calculateBudget: function(){
            // Calc total income and total expense
            calcTotal('inc');
            calcTotal('exp');

            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentage
            if (data.totals.inc > 0){
                data.percentageExp = Math.round(data.totals.exp/data.totals.inc * 100);
            } else {
                data.percentageExp = -1;
            } 
        },

        removeItem: function(type, id){
            
            // Get index of ID to be removed
            var ids = data.allItems[type].map(function(item){
                return item.id;
            });
         
            var indexOfID = ids.indexOf(id);

            if (indexOfID !== -1){
                data.allItems[type].splice(indexOfID, 1);
            }
            
        },

        calcPercentages: function(){
            var expenses = data.allItems.exp
            expenses.forEach(function(expense){
                expense.calcPercentage(data.totals.inc);
            });
            return expenses;
        },

        data: data

    };

})();

//UI Controller
var UIcontroller = (function(){

    var DOMelement = {
        addType:    document.querySelector('.add__type'),
        description: document.querySelector('.add__description'),
        value:       document.querySelector('.add__value'),
        add:         document.querySelector('.add__btn'),
        incomeList:  document.querySelector('.income__list'),
        expenseList: document.querySelector('.expenses__list'),
        budget:      document.querySelector('.budget__value'),
        totalIncome: document.querySelector('.budget__income--value'),
        totalExpense:document.querySelector('.budget__expenses--value'),
        percentageExpense: document.querySelector('.budget__expenses--percentage'),
        container: document.querySelector('.container'),
        date: document.querySelector('.budget__title--month')
    }        

    function addItem(item){

        var htmlItem = buildHTML(item);

        if (item.constructor.name === 'Income') {
            DOMelement.incomeList.insertAdjacentHTML('beforeend', htmlItem)
        } else if (item.constructor.name === 'Expense') {
            DOMelement.expenseList.insertAdjacentHTML('beforeend', htmlItem)
        };

        // Inner function
        function buildHTML(item){
            if (item.constructor.name === 'Income'){
                var template = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> + %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (item.constructor.name === 'Expense'){
                var template = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> - %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            var itemHTML = template.replace('%id%', item.id);
            itemHTML = itemHTML.replace('%description%', item.description);
            itemHTML = itemHTML.replace('%value%', format(item.value));
            return itemHTML;
        }
    };

    function format(number){
        return (number).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
    }

    return {
        getInput: function(){
            return {
                type:        DOMelement.addType.value,
                description: DOMelement.description.value,
                value:       DOMelement.value.value
            }              
        },

        getDOMelements: function(){
            return DOMelement;
        },

        addItem: function(item){
            addItem(item)
        },

        clearInput: function(){
            DOMelement.description.value = '';
            DOMelement.value.value = '';
            DOMelement.description.focus();
            //DOMelement.addType.value = 'inc';
        },

        displayBudget: function(budget){
            DOMelement.budget.textContent = (budget.budget>0 ? '+': '') + format(budget.budget);
            DOMelement.totalIncome.textContent  ='+ ' + format(budget.income);
            DOMelement.totalExpense.textContent ='- ' + format(budget.expense);
            DOMelement.percentageExpense.textContent = budget.percentageExp != -1 ? budget.percentageExp + '%': '...';
        },

        removeItem: function(itemID){
            var el = document.getElementById(itemID)
            // In Javascript you cannot remove element itself, you have to remove childs
            // So we need to go one level up and then remove child
            el.parentNode.removeChild(el)
        },

        displayPercentages: function(expenses){

            expenses.forEach(function(expense){
                var percentageElement = document.querySelector('#exp-' + expense.id + ' .right .item__percentage');
                percentageElement.textContent = expense.percentage != -1 ? expense.percentage + '%' : '...';
            })
        },

        displayDate: function(){
            var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var date = new Date();
            DOMelement.date.textContent = month[date.getMonth()] +', ' + date.getFullYear();
        },

        changeType: function(){
            var inputFields = document.querySelectorAll('.add__type, .add__description, .add__value');
            inputFields.forEach(function(field){
                field.classList.toggle('red-focus')
                console.log(field.classList);    
            });
            DOMelement.add.classList.toggle('red')
        }
          
    }
})();


// Global app controller
var controller = (function(budgetCtrl, UICtrl){

    function setEventListeners(){
        var DOMelements = UIcontroller.getDOMelements()

        // Event listener to Add button and Enter keypress to AddItem
        DOMelements.add.addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode == 13){
                ctrlAddItem()
            }
        });

        // Event listener to income and expense list container to catch delete button and then DeleteItem
        DOMelements.container.addEventListener('click', ctrlDeleteItem);

        // Event listener when type is changed
        DOMelements.addType.addEventListener('change', UICtrl.changeType);

    };

    function updateBudget(){
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Get budget
        var budget = budgetCtrl.getBudget();
        
        // Update UI
        UICtrl.displayBudget(budget)
        
    };

    function updatePercentage(){
        //Update storage model
        var expenses = budgetCtrl.calcPercentages();

        // Update UI
        
        UICtrl.displayPercentages(expenses);
        
    }

    function ctrlAddItem(){
        
        //1.- Get the filed input data
            var input = UICtrl.getInput();

            // Add item only when there is a description and a value
            if (input.description !== "" && input.value !== ""){  

                //2.- Add the item to the budget controller
                var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

                //3.- Add the item to the UI
                    UICtrl.addItem(newItem);
                    // Clear fields and focus back to Add Description
                    UICtrl.clearInput();

                //4.- Calculate the budget and Display the budget on the UI
                    updateBudget();

                //5.- Update percentage
                    updatePercentage();

            }

    }

    function ctrlDeleteItem(event){ // Needs to take event to do element targetting and identify which ID triggered the event
        // Identify which item was clicked
        var type, id;
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // Target catches the element where event was applied = Targeting. Needs to go up 4 levels and get id if available. This is traversing
        if (itemID){        
            [type, id] = itemID.split('-');

            // Remove item from list
            budgetCtrl.removeItem(type, Number(id));

            // Remove item from UI
            UICtrl.removeItem(itemID);

            // Calculate and update the new budget
            updateBudget()

            //Update percentage
            updatePercentage();
         };

    }


    return{
        init: function(){
            console.log('App started!');
            UICtrl.displayDate();
            setEventListeners();
            var budget = budgetCtrl.getBudget();
            UICtrl.displayBudget(budget);
        }
    }

})(budgetController, UIcontroller);

controller.init();