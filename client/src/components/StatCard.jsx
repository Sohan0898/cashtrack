import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass, cardBgClass, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass-card p-6 flex items-start justify-between ${cardBgClass || ''}`}
    >
      <div>
        <p className={`text-sm font-medium mb-1 ${cardBgClass ? 'opacity-80' : 'text-base-content/60'}`}>{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
        {trend && (
          <div className="mt-2 text-xs font-medium">
            <span className={trend.isPositive ? 'text-success' : 'text-error'}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-base-content/50 ml-1">vs last month</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};

export default StatCard;
