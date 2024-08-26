import React, { useState, useEffect } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StatisticGraph = ({ events, loading }) => {
    const [weeklyEfficiency, setWeeklyEfficiency] = useState([]);
    const [eventStatistics, setEventStatistics] = useState([]);

    useEffect(() => {
        // Helper function to get the start of the week (Sunday) and end of the week (Saturday)
        const getWeekRange = (date) => {
            const start = new Date(date);
            const day = start.getDay();
            const diff = start.getDate() - day;
            const startOfWeek = new Date(start.setDate(diff));
            const endOfWeek = new Date(start.setDate(start.getDate() + 6));
            return {
                start: `${startOfWeek.getDate()}-${startOfWeek.toLocaleString('default', { month: 'short' }).toUpperCase()}`,
                end: `${endOfWeek.getDate()}-${endOfWeek.toLocaleString('default', { month: 'short' }).toUpperCase()}`
            };
        };

        // Calculate weekly efficiency based on ranked events
        const calculateWeeklyEfficiency = (events) => {
            const weeks = {};
            const today = new Date();

            // Calculate week labels for 3 weeks before, the current week
            for (let i = -3; i <= 0; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i * 7);
                const { start, end } = getWeekRange(date);
                const weekLabel = `${start} - ${end}`;
                weeks[weekLabel] = { totalRank: 0, count: 0 };
            }

            events.forEach((event) => {
                const eventDate = new Date(event.startTime);
                const { start, end } = getWeekRange(eventDate);
                const weekLabel = `${start} - ${end}`;

                if (weeks[weekLabel]) {
                    if (event.isRanked) {
                        weeks[weekLabel].totalRank += event.rank;
                        weeks[weekLabel].count++;
                    }
                }
            });

            return Object.keys(weeks).map((week) => ({
                weekLabel: week,
                efficiencyScore: weeks[week].count > 0 ? weeks[week].totalRank / weeks[week].count : 0,
            }));
        };

        // Calculate event statistics
        const calculateEventStatistics = (events) => {
            const eventTypes = ['Study', 'Hobby', 'Social'];
            const statistics = {};

            eventTypes.forEach((type) => {
                statistics[type] = { totalHours: 0, count: 0 };
            });

            const today = new Date();
            const twoWeeksFromNow = new Date(today);
            twoWeeksFromNow.setDate(today.getDate() + 14);

            events.forEach((event) => {
                const eventDate = new Date(event.startTime);
                if (eventDate >= today && eventDate <= twoWeeksFromNow && eventTypes.includes(event.eventType)) {
                    const [hours, minutes] = event.duration.split(':').map(Number);
                    const durationInHours = hours + minutes / 60;
                    statistics[event.eventType].totalHours += durationInHours;
                    statistics[event.eventType].count++;
                }
            });

            return eventTypes.map((type) => ({
                label: type,
                y: statistics[type].totalHours,
            }));
        };

        setEventStatistics(calculateEventStatistics(events));
        setWeeklyEfficiency(calculateWeeklyEfficiency(events));
    }, [events]);

    const weeklyEfficiencyOptions = {
        animationEnabled: true,
        theme: 'light2',
        title: {
            text: 'Weekly Efficiency (Last 4 Weeks)',
        },
        axisY: {
            title: 'Efficiency Score (0-10)',
            maximum: 10,
            interval: 1,
        },
        axisX: {
            title: 'Weeks',
            interval: 1,
        },
        data: [
            {
                type: 'line',
                dataPoints: weeklyEfficiency.map((week) => ({
                    label: week.weekLabel,
                    y: week.efficiencyScore,
                })),
            },
        ],
    };

    const timeManagementOptions = {
        animationEnabled: true,
        theme: 'light2',
        title: {
            text: 'Time Management for Next 14 Days',
        },
        axisY: {
            title: 'Hours',
        },
        axisX: {
            title: 'Event Types',
        },
        data: [
            {
                type: 'column',
                dataPoints: eventStatistics,
            },
        ],
    };

    return (
        <div id="statistic">
            {loading ? (
                <p>Loading event statistics...</p>
            ) : (
                <Tabs>
                    <TabList>
                        <Tab>Time Management</Tab>
                        <Tab>Weekly Efficiency</Tab>
                    </TabList>
                    <TabPanel>
                        <CanvasJSChart options={timeManagementOptions} />
                    </TabPanel>
                    <TabPanel>
                        <CanvasJSChart options={weeklyEfficiencyOptions} />
                    </TabPanel>
                </Tabs>
            )}
        </div>
    );
};

export default StatisticGraph;

// Helper function to get week number
Date.prototype.getWeek = function () {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};