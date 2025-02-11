import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Charts } from './Charts/Charts';
import { PieChart } from './Charts/PieChart';
import { AttachMoney, MoneyOff } from '@mui/icons-material';
import LineChart from './Charts/LineChart';
import { GoalCharts } from './Charts/GoalCharts';
import MonthlyBarChart from './Charts/MonthlyBarChart';
import { PayeeManage } from './User/PayeeManage';
import Button from '@mui/material/Button';
import { Chip, Modal, TextField } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useForm } from 'react-hook-form';
import { DonutChartPaymentType } from './Charts/DonutChartPaymentType';
import { CategoryManage } from './User/CategoryManage';
import INCOME from './assets/img/expense/wallet.png';
import EXPENSE from './assets/img/expense/spending-money.png';
import BALANACE3 from './assets/img/expense/target-4.png';
import BALANACE from './assets/img/expense/money.png';
import './Dashboard.css';
import { Link, useNavigate } from 'react-router-dom';

export const UserDashBoard = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [goalExpenses, setGoalExpenses] = useState({});
  const [goalExpenses2, setGoalExpenses2] = useState({});
  const [goals, setGoals] = useState([]);
  const [eachGoalTotal, setEachGoalTotal] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [payees, setPayees] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const getIncome = async () => {
    const res = await axios.get('http://localhost:5000/transactions/income');
    // setincome(res.data.data);
  };

  const getExpense = async () => {
    const res = await axios.get('http://localhost:5000/transactions/expense');
    // setExpense(res.data.data);
  };

  const getAllGoals = async (req, res) => {
    try {
      const res = await axios.get('http://localhost:5000/goals/goal');
      setGoals(res.data.data);

      // Extracting maxamount from each goal and storing them in an array
      const maxAmounts = data.map(goal => goal.maxamount);
      setEachGoalTotal(maxAmounts);
    } catch (error) {
      console.log('error....', error);
    }
  };

  const filterTransactionsByGoal = selectedGoal => {
    // Filter transactions based on the selected goal
    // For now, let's assume transactions are already fetched and stored in `data` state
    const filteredTransactions = data.filter(
      transaction => transaction._id === selectedGoal
    );
    prepareChartData(filteredTransactions);
  };

  const prepareChartData = transactions => {
    const goalExpensesMap = {};
    transactions.forEach(transaction => {
      const category = transaction.category.categoryName;
      if (goalExpensesMap[category]) {
        goalExpensesMap[category] += transaction.amount;
      } else {
        goalExpensesMap[category] = transaction.amount;
      }
    });
    setGoalExpenses2(goalExpensesMap);
  };

  useEffect(() => {
    getTransactionsData();
    getAllGoals();
  }, []);

  useEffect(() => {
    if (selectedGoal) {
      filterTransactionsByGoal(selectedGoal);
    }
  }, [selectedGoal]);

  useEffect(() => {
    console.log('goalExpenses....', goalExpenses);
    console.log('goals....', goals);
  }, [goalExpenses]);

  const [data, setdata] = useState([]);

  // const getTransactionsData = async () => {
  //   const id = localStorage.getItem('userId');
  //   try {
  //     const res = await axios.get(
  //       'http://localhost:5000/transactions/transactions/' + id
  //     );
  //     console.log(res.data.data);
  //     setdata(res.data.data);

  //     let totalIncome = 0;
  //     let totalExpense = 0;
  //     let goalExpensesMap = {};

  //     res.data.data.forEach(transaction => {
  //       if (transaction.transactionType === 'income') {
  //         totalIncome += transaction.amount;
  //       } else if (transaction.transactionType === 'Expense') {
  //         totalExpense += Math.abs(transaction.amount); // Absolute value of amount for expense

  //         if (transaction.goal) {
  //           const goalId = transaction.goal._id;
  //           if (goalExpensesMap[goalId]) {
  //             goalExpensesMap[goalId] += transaction.amount;
  //           } else {
  //             goalExpensesMap[goalId] = transaction.amount;
  //           }
  //         }
  //       }
  //     });

  //     setIncome(totalIncome);
  //     setExpense(totalExpense);
  //     setTotalBalance(totalIncome - totalExpense);
  //     setGoalExpenses(goalExpensesMap);
  //     console.log(goalExpenses)
  //   } catch (error) {
  //     console.log('Error in fetching transaction details....', error);
  //   }
  // };

  const getTransactionsData = async () => {
    const id = localStorage.getItem('userId');
    try {
      const res = await axios.get(
        'http://localhost:5000/transactions/transactions/' + id
      );
      console.log(res.data.data);
      setdata(res.data.data);

      let totalIncome = 0;
      let totalExpense = 0;
      let goalExpensesMap = {};

      res.data.data.forEach(transaction => {
        const transactionType = transaction.transactionType.toLowerCase();

        if (transactionType === 'income') {
          totalIncome += transaction.amount;
        } else if (transactionType === 'expense') {
          totalExpense += Math.abs(transaction.amount); // Absolute value of amount for expense

          if (transaction.goal) {
            const goalName = transaction.goal.goalName;
            const goalId = transaction.goal._id;
            const maxAmount = transaction.goal.maxamount;
            if (goalExpensesMap[goalId]) {
              goalExpensesMap[goalId].amount += transaction.amount;
            } else {
              goalExpensesMap[goalId] = {
                name: goalName,
                amount: transaction.amount,
                maxamount: maxAmount,
              };
            }
          }
        }
      });

      setIncome(totalIncome);
      setExpense(totalExpense);
      setTotalBalance(totalIncome - totalExpense);
      setGoalExpenses(goalExpensesMap);
      console.log(goalExpenses);
    } catch (error) {
      console.error(
        'Error in fetching or processing transaction details:',
        error
      );
      // Optionally, you can set some default values or display an error message to the user.
    }
  };

  // For payee
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const loadPayee = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/payees/payees/' + userId
      );
      setPayees(res.data.data);
      console.log('payees....', res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadPayee();
  }, []);

  const updatePayees = newPayees => {
    setPayees(newPayees);
  };

  return (
    <div className="container-fluid">
      <div className="row mx-2">
        {/* <div className="col-lg-3 col-sm-6">
          <div className="card-stats card">
            <div className="card-body">
              <div className="row">
                <div className="col-5">
                  <div className="icon-big text-center icon-warning">
                    <i className="nc-icon nc-chart text-warning" />
                  </div>
                </div>
                <div className="col-7">
                  <div className="numbers">
                    <p className="card-category">Income</p>
                    <h4 className="card-title mt-1">{income}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <hr />
              <div className="stats">
                <i className="fas fa-redo mr-1" />
                Update Now
              </div>
            </div>
          </div>
        </div> */}

        <div className="col-sm-3">
          <div className="card card-shadow">
            <div className="row">
              <div className="col-md-8">
                <div class="row card-header">
                  <div class="col-md-12 card-title">
                    <h4>Income</h4>
                  </div>
                  <div class="col-md-12 card-body">
                    <p style={{ color: 'green', fontSize: '1.2em' }}>
                      {income}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <img
                  src={INCOME}
                  alt="RUPPES"
                  width={64}
                  height={64}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-3">
          <div className="card card-shadow">
            <div className="row">
              <div className="col-md-7">
                <div class="row card-header">
                  <div class="col-md-12 card-title">
                    <h4>Expense</h4>
                  </div>
                  <div class="col-md-12 card-body">
                    <p style={{ color: 'red', fontSize: '1.2em' }}>{expense}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-5">
                <img
                  src={EXPENSE}
                  alt="spending"
                  className="mt-2 ml-2"
                  width={70}
                  height={70}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-3">
          <div className="card card-shadow">
            <div className="row">
              <div className="col-md-8">
                <div class="row card-header">
                  <div class="col-md-12 card-title">
                    <h4>Balance</h4>
                  </div>
                  <div class="col-md-12 card-body">
                    <p style={{ color: 'blue', fontSize: '1.2em' }}>
                      {totalBalance}
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <img
                  src={BALANACE}
                  alt="balance"
                  width={64}
                  height={64}
                  className="mr-4 mt-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col mx-2">
          <h3 style={{ padding: '0' }}>Goals</h3>
        </div>
      </div>

      <div className="row">
        {Object.keys(goalExpenses).length > 0 ? (
          Object.keys(goalExpenses).map(goalId => (
            <div className="col-md-4" key={goalId}>
              <div className="card card-shadow">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-9">
                      <div className="row card-header">
                        <div className="col-md-12 card-title mb-n2">
                          <h4>{goalExpenses[goalId].name}</h4>
                        </div>
                        <div className="col-md-12 card-body mb-n3">
                          <p style={{ color: 'blue', fontSize: '1.2em' }}>
                            {goalExpenses[goalId].amount} /{' '}
                            {goalExpenses[goalId].maxamount}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <img
                        src={BALANACE3}
                        alt="balance"
                        width={64}
                        height={64}
                        className="ml-0 mr-4 mt-3 custom-opacity"
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <Button
                    className="mr-2"
                    variant="contained"
                    size="small"
                    color="primary"
                    style={{ textTransform: 'none !important' }}
                    onClick={() => navigate(`/goal/expenses/${goalId}`)}
                  >
                    Go to goal
                  </Button>
                  <Button
                    className="mr-2"
                    variant="contained"
                    size="small"
                    color="primary"
                    style={{ textTransform: 'none !important' }}
                    onClick={() => navigate('/expense/form')}
                  >
                    Add expense
                  </Button>
                  <div>
                    <Chip
                      label={
                        goalExpenses[goalId].amount >
                        goalExpenses[goalId].maxamount
                          ? 'Exceeded'
                          : 'Budget'
                      }
                      color={
                        goalExpenses[goalId].amount >
                        goalExpenses[goalId].maxamount
                          ? 'error'
                          : 'success'
                      }
                      className="ml-3"
                      style={{ display: 'flex', alignItems: 'center' }}
                      size="medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-md-4">
            <div className="card card-shadow">
              <div className="row">
                <div className="col-md-12">
                  <div className="card-header">
                    <h4>Add Goal</h4>
                  </div>
                  <div className="card-body">
                    <p style={{ color: 'gray' }}>
                      Start by setting a new goal.
                      <br />
                      <Link to="/user/goal" className="m-0">
                        Go to goal
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row mt-4 ">
        <div className="col-md-5">
          <div className="card card-shadow">
            <div className="card-header ">
              <h4 className="card-title">Category Expenses</h4>
              <p className="card-category">Last Campaign Performance</p>
            </div>
            <div className="card-body ">
              <PieChart />
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="card card-shadow">
            <div className="card-header ">
              <h4 className="card-title">Income and Expense Trends</h4>
              <p className="card-category">24 Hours performance</p>
            </div>
            <div className="card-body ">
              {/* <Charts /> */}
              <LineChart />
            </div>
          </div>
        </div>
      </div>

      {/* Goal Chart */}
      <div className="row mt-3">
        <div className="col-md-5 card-shadow">
          {/* <h3 className="m-0">Goal Expenses</h3> */}
          <GoalCharts />
        </div>

        <div className="col-md-7">
          <div className="card card-shadow">
            <div className="card-header ">
              <h4 className="card-title">Income and Expense Trends</h4>
              <p className="card-category">24 Hours performance</p>
            </div>
            <div className="card-body">
              <MonthlyBarChart />
            </div>
          </div>
        </div>
      </div>

      {/* payee management */}
      <div className="row mt-4 ">
        <div className="col-md-4">
          <div className="card card-shadow">
            <PayeeManage />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-shadow">
            <CategoryManage />
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-shadow">
            <div className="card-header ">
              <h4 className="card-title">Payment Type Distribution</h4>
              <p className="card-category">24 Hours performance</p>
            </div>
            <div className="card-body" style={{ margin: '0px auto' }}>
              <DonutChartPaymentType />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
