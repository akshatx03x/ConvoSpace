import React from 'react'

const FeatureCard = () => {
  return (
    <div>
      <div className="lg:w-1/2 space-y-6">
                    <FeatureCard 
                        icon={<i className="fas fa-lock"></i>} 
                        title="End-to-End Encryption" 
                        description="Your calls are secured with industry-standard encryption, ensuring only you and your participants can access the media stream."
                    />
                    <FeatureCard 
                        icon={<i className="fas fa-sync-alt"></i>} 
                        title="Real-Time Performance" 
                        description="Built on WebRTC and Socket technology for minimal latency, delivering seamless and instantaneous audio and video transfer."
                    />
                    <FeatureCard 
                        icon={<i className="fas fa-users"></i>} 
                        title="Multi-User Ready" 
                        description="Easily host group meetings. Simply share the Room ID and start collaborating with multiple peers instantly."
                    />
                </div>
    </div>
  )
}

export default FeatureCard
