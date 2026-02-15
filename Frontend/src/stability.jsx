import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Home.css'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
];

export default function StabilityGraph() {
    return (
        <div>
            <h1> Bar graph trial </h1>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data ={data}>
                <XAxis dataKey="name"/>
                <YAxis dataKey="value"/>
                <Bar dataKey="value" fill="#8884d8"/>

               



                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}