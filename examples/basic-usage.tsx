import React, { useState, useRef } from 'react';
import {
  useAutoSkeleton,
  withAutoSkeleton,
  AutoSkeleton,
  SkeletonProvider,
  SimpleSkeleton,
  TextSkeleton,
  AvatarSkeleton,
  CardSkeleton,
  quickSetup,
} from 'auto-skeleton';

// Example 1: Using the hook pattern
function UserProfileWithHook() {
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const { SkeletonComponent } = useAutoSkeleton(componentRef, {
    animation: { type: 'shimmer', duration: 1500 },
    theme: { type: 'light' },
  });

  // Simulate data loading
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SkeletonComponent />;
  }

  return (
    <div ref={componentRef} className="user-profile">
      <div className="avatar-section">
        <img 
          src="https://via.placeholder.com/80" 
          alt="User Avatar" 
          className="avatar"
          style={{ width: 80, height: 80, borderRadius: '50%' }}
        />
        <div className="user-info">
          <h2>John Doe</h2>
          <p>Software Engineer</p>
          <p>San Francisco, CA</p>
        </div>
      </div>
      <div className="bio">
        <p>
          Passionate full-stack developer with 5+ years of experience building 
          scalable web applications. Love working with React, Node.js, and modern 
          JavaScript technologies.
        </p>
      </div>
    </div>
  );
}

// Example 2: Using HOC pattern
const UserCard = ({ user, loading }: { user: any; loading?: boolean }) => (
  <div className="user-card" style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
      <img 
        src={user.avatar} 
        alt={user.name}
        style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }}
      />
      <div>
        <h3 style={{ margin: 0, fontSize: 16 }}>{user.name}</h3>
        <p style={{ margin: 0, fontSize: 14, color: '#666' }}>{user.email}</p>
      </div>
    </div>
    <p style={{ margin: 0, fontSize: 14 }}>{user.bio}</p>
  </div>
);

const UserCardWithSkeleton = withAutoSkeleton(UserCard, {
  theme: { type: 'light' },
  animation: { type: 'pulse', duration: 1200 },
});

// Example 3: Using declarative AutoSkeleton component
function BlogPost() {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AutoSkeleton loading={loading} options={quickSetup('light')}>
      <article style={{ maxWidth: 600, padding: 20 }}>
        <h1>Understanding React Hooks</h1>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <img 
            src="https://via.placeholder.com/32" 
            alt="Author"
            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 12 }}
          />
          <div>
            <span>Jane Smith</span>
            <span style={{ color: '#666', marginLeft: 8 }}>March 15, 2024</span>
          </div>
        </div>
        <img 
          src="https://via.placeholder.com/600x300" 
          alt="Blog post cover"
          style={{ width: '100%', height: 300, objectFit: 'cover', marginBottom: 16 }}
        />
        <p>
          React Hooks have revolutionized how we write React components. 
          They allow us to use state and other React features without writing class components.
        </p>
        <p>
          In this comprehensive guide, we'll explore the most commonly used hooks 
          and learn how to create custom hooks for your specific use cases.
        </p>
      </article>
    </AutoSkeleton>
  );
}

// Example 4: Using manual skeleton components
function ManualSkeletonExample() {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <AvatarSkeleton size={48} />
          <div style={{ marginLeft: 16, flex: 1 }}>
            <SimpleSkeleton width="40%" height={20} style={{ marginBottom: 8 }} />
            <SimpleSkeleton width="60%" height={16} />
          </div>
        </div>
        
        {/* Content skeleton */}
        <TextSkeleton lines={4} fontSize={16} />
        
        {/* Card skeletons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          <CardSkeleton showAvatar showImage titleLines={2} bodyLines={3} />
          <CardSkeleton showAvatar showImage titleLines={1} bodyLines={4} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <img 
          src="https://via.placeholder.com/48" 
          alt="Profile"
          style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 16 }}
        />
        <div>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <p style={{ margin: 0, color: '#666' }}>Welcome back, John!</p>
        </div>
      </div>
      
      <p>
        Here's your activity summary for today. You have 3 new messages, 
        5 pending tasks, and 2 upcoming meetings.
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Recent Activity</h3>
          <p>Task completed: Update documentation</p>
          <p>Meeting scheduled: Team standup</p>
        </div>
        <div style={{ padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
          <h3>Quick Stats</h3>
          <p>Tasks completed today: 7</p>
          <p>Messages read: 12</p>
        </div>
      </div>
    </div>
  );
}

// Example 5: Using SkeletonProvider for global configuration
function App() {
  return (
    <SkeletonProvider
      defaultTheme={{ type: 'light', baseColor: '#f0f0f0' }}
      defaultAnimation={{ type: 'shimmer', duration: 1500 }}
      globalOptions={{
        respectUserMotion: true,
        enableCaching: true,
      }}
    >
      <div style={{ padding: 20 }}>
        <h1>Auto-Skeleton Examples</h1>
        
        <section style={{ marginBottom: 40 }}>
          <h2>1. Hook Pattern</h2>
          <UserProfileWithHook />
        </section>
        
        <section style={{ marginBottom: 40 }}>
          <h2>2. HOC Pattern</h2>
          <UserCardWithSkeleton
            loading={true}
            user={{
              name: 'John Doe',
              email: 'john@example.com',
              avatar: 'https://via.placeholder.com/40',
              bio: 'Frontend developer passionate about React and TypeScript.',
            }}
          />
        </section>
        
        <section style={{ marginBottom: 40 }}>
          <h2>3. Declarative AutoSkeleton</h2>
          <BlogPost />
        </section>
        
        <section style={{ marginBottom: 40 }}>
          <h2>4. Manual Skeleton Components</h2>
          <ManualSkeletonExample />
        </section>
      </div>
    </SkeletonProvider>
  );
}

export default App;
