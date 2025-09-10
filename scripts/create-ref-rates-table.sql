-- Creating ref_rates table and populating with JavaScript data
-- Create ref_rates table if it doesn't exist
CREATE TABLE IF NOT EXISTS ref_rates (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    item VARCHAR(200) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE TABLE ref_rates RESTART IDENTITY;

-- Insert reference rates data
INSERT INTO ref_rates (category, item, unit, rate, description) VALUES
-- Materials
('material', 'PVC Pipe (4 inch)', 'meter', 180.00, 'Standard PVC pipe for drainage'),
('material', 'PVC Pipe (6 inch)', 'meter', 280.00, 'Large PVC pipe for main drainage'),
('material', 'Gravel (20mm)', 'cubic_meter', 1200.00, 'Coarse gravel for filtration'),
('material', 'Sand (Fine)', 'cubic_meter', 800.00, 'Fine sand for filtration layers'),
('material', 'Cement (OPC 43)', 'bag', 350.00, 'Ordinary Portland Cement'),
('material', 'Steel Reinforcement', 'kg', 65.00, 'TMT bars for structural work'),
('material', 'Brick (Common)', 'piece', 8.00, 'Standard clay bricks'),
('material', 'Concrete Block', 'piece', 45.00, 'Precast concrete blocks'),
('material', 'Geotextile Fabric', 'sqm', 120.00, 'Non-woven geotextile for filtration'),
('material', 'Manhole Cover (CI)', 'piece', 2500.00, 'Cast iron manhole cover'),

-- Labor
('labor', 'Skilled Mason', 'day', 800.00, 'Experienced construction worker'),
('labor', 'Unskilled Labor', 'day', 500.00, 'General construction helper'),
('labor', 'Plumber', 'day', 1000.00, 'Certified plumbing specialist'),
('labor', 'Electrician', 'day', 1200.00, 'Licensed electrical worker'),
('labor', 'Excavation Labor', 'cubic_meter', 150.00, 'Manual excavation work'),
('labor', 'Concrete Work', 'cubic_meter', 800.00, 'Concrete mixing and pouring'),

-- Equipment
('equipment', 'JCB/Excavator', 'hour', 1500.00, 'Mechanical excavation equipment'),
('equipment', 'Concrete Mixer', 'day', 800.00, 'Portable concrete mixing machine'),
('equipment', 'Water Tanker', 'trip', 1200.00, 'Water supply for construction'),
('equipment', 'Compactor', 'day', 1000.00, 'Soil compaction equipment'),
('equipment', 'Generator (5 KVA)', 'day', 600.00, 'Portable power generator'),

-- Overhead
('overhead', 'Site Supervision', 'percentage', 8.00, 'Project management and supervision'),
('overhead', 'Transportation', 'percentage', 5.00, 'Material and equipment transport'),
('overhead', 'Contractor Profit', 'percentage', 12.00, 'Contractor profit margin'),
('overhead', 'Contingency', 'percentage', 10.00, 'Unforeseen expenses buffer');

-- Verify the data was inserted
SELECT COUNT(*) as total_records FROM ref_rates;
SELECT category, COUNT(*) as count FROM ref_rates GROUP BY category;
