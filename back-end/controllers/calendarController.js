const Todo = require('../models/Calendar');

const getSchedules = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const startOfDay = new Date(startDate);
        const endOfDay = new Date(endDate);

        const todos = await Todo.find({
            startDate: {
                $lte: startOfDay
            },
            endDate: {
                $gte: endOfDay
            }
        });
        res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching schedules', error });
    }
};

const createSchedule = async (req, res) => {
    try {
        const newData = new Todo(req.body);
        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
};

const deleteSchedules = async (req, res) => {
    try {
        const { ids } = req.body;
        await Todo.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: '일정이 삭제되었습니다.' });
    } catch (error) {
        res.status(500).json({ message: '일정 삭제에 실패했습니다.', error });
    }
};

module.exports = {
    createSchedule, 
    getSchedules,
    deleteSchedules
};
