const Todo = require('../models/Calendar');

const createSchedule = async (req, res) => {
    try {
        const { _id } = req.user;  // 토큰에서 가져온 username
        const { todoData } = req.body;

        const newData = new Todo({
            userId: _id,
            ...todoData
        });

        const savedData = await newData.save();
        res.json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error });
    }
};

const getSchedules = async (req, res) => {
    try {
        const { _id } = req.user;
        const { startDate, endDate } = req.query;

        const startOfDay = new Date(startDate);
        const endOfDay = new Date(endDate);

        const todos = await Todo.find({
            userId: _id,
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

const deleteSchedules = async (req, res) => {
    try {
        const { _id } = req.user;
        const { ids } = req.body;

        await Todo.deleteMany({ _id: { $in: ids }, userId: _id });
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
