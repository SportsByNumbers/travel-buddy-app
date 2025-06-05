import React, { useContext, useState, useEffect } from 'react';
import { TripContext } from '../App.jsx'; // Explicit .jsx
import SectionWrapper from './SectionWrapper.jsx'; // Explicit .jsx
import InputField from './InputField.jsx'; // Explicit .jsx
import { PlusCircle, DollarSign, XCircle } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const ExpenseTracker = () => {
    const { db, userId, currentTripId, expenses, currency, getFormattedCurrency } = useContext(TripContext);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food'); // Default category
    const [expenseDate, setExpenseDate] = useState(''); // Date of expense
    const [amountError, setAmountError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');

    const expenseCategories = ['Food', 'Transport', 'Activities', 'Hotel', 'Flight', 'Miscellaneous', 'Shopping'];

    // Set default expense date to today
    useEffect(() => {
        const today = new Date();
        setExpenseDate(today.toISOString().split('T')[0]); // YYYY-MM-DD
    }, []);

    const handleAddExpense = async () => {
        let hasError = false;
        if (!description.trim()) {
            setDescriptionError("Description cannot be empty.");
            hasError = true;
        } else {
            setDescriptionError('');
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setAmountError("Amount must be a positive number.");
            hasError = true;
        } else {
            setAmountError('');
        }

        if (hasError) return;

        if (!db || !userId || !currentTripId) {
            console.error("Cannot add expense: Firestore not initialized, user not authenticated, or no trip selected.");
            // Optionally, show a user-friendly message
            return;
        }

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        try {
            await addDoc(collection(db, `artifacts/${appId}/users/${userId}/trips/${currentTripId}/expenses`), {
                description: description.trim(),
                amount: parseFloat(amount),
                category: category,
                currency: currency,
                date: new Date(expenseDate), // Store as Firestore Timestamp
                createdAt: serverTimestamp(),
            });
            setDescription('');
            setAmount('');
            setCategory('Food');
            setExpenseDate(new Date().toISOString().split('T')[0]); // Reset to today
            console.log("Expense added successfully!");
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!db || !userId || !currentTripId) {
            console.error("Cannot delete expense: Firestore not initialized, user not authenticated, or no trip selected.");
            return;
        }
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/trips/${currentTripId}/expenses`, expenseId));
            console.log("Expense deleted successfully:", expenseId);
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    return (
        <SectionWrapper title="Expense Tracker" icon={DollarSign}>
            {!currentTripId ? (
                <p className="text-center text-gray-600 text-lg py-10">Select or create a trip to start tracking expenses.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <InputField
                            id="expenseDescription"
                            label="Description"
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setDescriptionError(''); }}
                            placeholder="e.g., Dinner at local restaurant"
                            error={descriptionError}
                            required
                        />
                        <InputField
                            id="expenseAmount"
                            label="Amount"
                            type="number"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setAmountError(''); }}
                            placeholder={`e.g., 50 (${currency})`}
                            error={amountError}
                            required
                        />
                        <InputField
                            id="expenseCategory"
                            label="Category"
                            type="select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            options={expenseCategories.map(cat => ({ value: cat, label: cat }))}
                            required
                        />
                         <InputField
                            id="expenseDate"
                            label="Date"
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        onClick={handleAddExpense}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md w-full md:w-auto"
                    >
                        <PlusCircle size={20} className="inline-block mr-2" /> Add Expense
                    </button>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recorded Expenses ({expenses.length})</h3>
                        {expenses.length === 0 ? (
                            <p className="text-gray-500">No expenses recorded for this trip yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg shadow-md">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Date</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Description</th>
                                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Category</th>
                                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {expenses.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">{expense.date.toLocaleDateString()}</td>
                                                <td className="py-3 px-4 text-sm text-gray-800">{expense.description}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600">{expense.category}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-right font-medium text-gray-900">{getFormattedCurrency(expense.amount)}</td>
                                                <td className="py-3 px-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                                                        title="Delete Expense"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </SectionWrapper>
    );
};

export default ExpenseTracker;
