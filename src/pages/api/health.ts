
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/logic/firebase/config/app';
import { collection, getDocs, limit, query } from 'firebase/firestore';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    firebase: boolean;
    environment: string;
    apis: {
      bludata: boolean;
      gemini: boolean;
      cnpja: boolean;
      apicpf: boolean;
      digisac: boolean;
    };
  };
  version: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheck>
) {
  try {
    // Test Firebase connection
    let firebaseStatus = false;
    try {
      const testQuery = query(collection(db, 'test'), limit(1));
      await getDocs(testQuery);
      firebaseStatus = true;
    } catch (error) {
      console.error('Firebase health check failed:', error);
    }

    // Check API keys
    const apis = {
      bludata: !!process.env.BLUDATA_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      cnpja: !!process.env.CNPJA_API_TOKEN,
      apicpf: !!process.env.APICPF_TOKEN,
      digisac: !!process.env.NEXT_PUBLIC_DIGISAC_TOKEN
    };

    const allServicesHealthy = firebaseStatus && Object.values(apis).every(Boolean);

    const healthData: HealthCheck = {
      status: allServicesHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase: firebaseStatus,
        environment: process.env.NODE_ENV || 'development',
        apis
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    const statusCode = allServicesHealthy ? 200 : 503;
    res.status(statusCode).json(healthData);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase: false,
        environment: process.env.NODE_ENV || 'development',
        apis: {
          bludata: false,
          gemini: false,
          cnpja: false,
          apicpf: false,
          digisac: false
        }
      },
      version: 'unknown'
    });
  }
}
