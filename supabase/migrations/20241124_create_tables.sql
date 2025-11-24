-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT CHECK (plan IN ('basic', 'premium', 'enterprise')) DEFAULT 'basic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create datasets table
CREATE TABLE datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    format TEXT CHECK (format IN ('csv', 'excel', 'text')) NOT NULL,
    schema JSONB,
    row_count INTEGER DEFAULT 0,
    preview JSONB,
    file_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analyses table
CREATE TABLE analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    parameters JSONB,
    results JSONB,
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visualizations table
CREATE TABLE visualizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    chart_type TEXT NOT NULL,
    configuration JSONB,
    data JSONB,
    embed_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    insights JSONB,
    recommendations JSONB,
    export_format TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON users TO anon;
GRANT SELECT ON datasets TO anon;
GRANT SELECT ON analyses TO anon;
GRANT SELECT ON visualizations TO anon;
GRANT SELECT ON reports TO anon;

GRANT ALL PRIVILEGES ON users TO authenticated;
GRANT ALL PRIVILEGES ON datasets TO authenticated;
GRANT ALL PRIVILEGES ON analyses TO authenticated;
GRANT ALL PRIVILEGES ON visualizations TO authenticated;
GRANT ALL PRIVILEGES ON reports TO authenticated;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own datasets" ON datasets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own datasets" ON datasets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses" ON analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analyses" ON analyses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own visualizations" ON visualizations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM analyses 
        WHERE analyses.id = visualizations.analysis_id 
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own visualizations" ON visualizations
    FOR ALL USING (EXISTS (
        SELECT 1 FROM analyses 
        WHERE analyses.id = visualizations.analysis_id 
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM analyses 
        WHERE analyses.id = reports.analysis_id 
        AND analyses.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their own reports" ON reports
    FOR ALL USING (EXISTS (
        SELECT 1 FROM analyses 
        WHERE analyses.id = reports.analysis_id 
        AND analyses.user_id = auth.uid()
    ));