// services/healthRecommendationsService.js
const { supabase } = require('../utils/supabaseClient');

/**
 * Generate system recommendations based on patient data
 */
async function generateRecommendations(patientId) {
  try {
    // Get patient data
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error('Patient not found');
    }

    // Get latest prediction
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestPrediction = predictions?.[0];

    // Get recent health metrics
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(10);

    const recommendations = [];

    // Risk-based recommendations
    if (latestPrediction) {
      const riskLevel = latestPrediction.risk_level;
      const probability = latestPrediction.probability || 0;

      if (riskLevel === 'High' || probability > 0.7) {
        recommendations.push({
          recommendation_type: 'warning',
          title: 'High Stroke Risk Detected',
          description: 'Your recent assessment indicates a high risk of stroke. Please consult with your doctor immediately and follow their recommendations closely.',
          priority: 'urgent',
          category: 'medical_alert'
        });

        recommendations.push({
          recommendation_type: 'lifestyle',
          title: 'Immediate Lifestyle Changes',
          description: 'Reduce salt intake to less than 2g per day, avoid processed foods, maintain regular exercise, and monitor blood pressure daily.',
          priority: 'high',
          category: 'diet_exercise'
        });
      } else if (riskLevel === 'Moderate' || probability > 0.4) {
        recommendations.push({
          recommendation_type: 'lifestyle',
          title: 'Moderate Risk - Preventive Measures',
          description: 'Maintain a balanced diet, regular exercise (30 minutes daily), monitor blood pressure weekly, and reduce stress levels.',
          priority: 'high',
          category: 'prevention'
        });
      }
    }

    // Blood pressure recommendations
    const bpMetrics = metrics?.filter(m => m.metric_type === 'blood_pressure');
    if (bpMetrics && bpMetrics.length > 0) {
      const latestBP = bpMetrics[0].value;
      if (latestBP > 140) {
        recommendations.push({
          recommendation_type: 'diet',
          title: 'Lower Blood Pressure',
          description: 'Your blood pressure is elevated. Reduce sodium intake, increase potassium-rich foods (bananas, spinach), and limit alcohol consumption.',
          priority: 'high',
          category: 'hypertension_management'
        });
      }
    }

    // Blood sugar recommendations
    const sugarMetrics = metrics?.filter(m => m.metric_type === 'blood_sugar');
    if (sugarMetrics && sugarMetrics.length > 0) {
      const latestSugar = sugarMetrics[0].value;
      if (latestSugar > 140) {
        recommendations.push({
          recommendation_type: 'diet',
          title: 'Manage Blood Sugar',
          description: 'Your blood sugar levels are elevated. Limit refined sugars, eat smaller frequent meals, and include fiber-rich foods in your diet.',
          priority: 'high',
          category: 'diabetes_management'
        });
      }
    }

    // BMI recommendations
    if (patient.bmi) {
      if (patient.bmi > 30) {
        recommendations.push({
          recommendation_type: 'exercise',
          title: 'Weight Management',
          description: 'Aim for gradual weight loss through a combination of diet and exercise. Start with 30 minutes of moderate exercise daily.',
          priority: 'medium',
          category: 'weight_management'
        });
      } else if (patient.bmi < 18.5) {
        recommendations.push({
          recommendation_type: 'diet',
          title: 'Healthy Weight Gain',
          description: 'Focus on nutrient-dense foods, regular meals, and strength training to build healthy muscle mass.',
          priority: 'medium',
          category: 'nutrition'
        });
      }
    }

    // General health recommendations
    recommendations.push({
      recommendation_type: 'hydration',
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses (2 liters) of water daily. Limit caffeinated and sugary beverages.',
      priority: 'medium',
      category: 'daily_habits'
    });

    recommendations.push({
      recommendation_type: 'sleep',
      title: 'Quality Sleep',
      description: 'Aim for 7-9 hours of quality sleep per night. Maintain a regular sleep schedule and create a relaxing bedtime routine.',
      priority: 'medium',
      category: 'sleep_hygiene'
    });

    recommendations.push({
      recommendation_type: 'stress_management',
      title: 'Stress Reduction',
      description: 'Practice relaxation techniques like deep breathing, meditation, or yoga. Take regular breaks and maintain work-life balance.',
      priority: 'medium',
      category: 'mental_health'
    });

    // Save recommendations to database
    if (recommendations.length > 0) {
      const recommendationsToInsert = recommendations.map(rec => ({
        patient_id: patientId,
        ...rec,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        created_by: null // System-generated
      }));

      // Deactivate old system recommendations
      await supabase
        .from('health_recommendations')
        .update({ is_active: false })
        .eq('patient_id', patientId)
        .is('created_by', null);

      // Insert new recommendations
      const { error: insertError } = await supabase
        .from('health_recommendations')
        .insert(recommendationsToInsert);

      if (insertError) {
        console.error('Error inserting recommendations:', insertError);
      }
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}

/**
 * Generate "When to See a Doctor" warnings
 */
async function generateWarnings(patientId) {
  try {
    const warnings = [];

    // Get latest prediction
    const { data: predictions } = await supabase
      .from('predictions')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    const latestPrediction = predictions?.[0];

    // Get recent health metrics
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false })
      .limit(5);

    // High risk warning
    if (latestPrediction && (latestPrediction.risk_level === 'High' || latestPrediction.probability > 0.7)) {
      warnings.push({
        recommendation_type: 'warning',
        title: '⚠️ See a Doctor Immediately',
        description: 'Your stroke risk assessment shows high risk. Please consult with a healthcare provider as soon as possible.',
        priority: 'urgent',
        category: 'emergency'
      });
    }

    // Blood pressure warning
    const bpMetrics = metrics?.filter(m => m.metric_type === 'blood_pressure');
    if (bpMetrics && bpMetrics.length > 0) {
      const latestBP = bpMetrics[0].value;
      if (latestBP > 180) {
        warnings.push({
          recommendation_type: 'warning',
          title: '⚠️ High Blood Pressure - Seek Medical Attention',
          description: `Your blood pressure reading of ${latestBP} mmHg is critically high. Please see a doctor immediately.`,
          priority: 'urgent',
          category: 'hypertension_emergency'
        });
      } else if (latestBP > 140) {
        warnings.push({
          recommendation_type: 'warning',
          title: '⚠️ Elevated Blood Pressure',
          description: `Your blood pressure (${latestBP} mmHg) is elevated. Schedule an appointment with your doctor within the next week.`,
          priority: 'high',
          category: 'hypertension_alert'
        });
      }
    }

    // Blood sugar warning
    const sugarMetrics = metrics?.filter(m => m.metric_type === 'blood_sugar');
    if (sugarMetrics && sugarMetrics.length > 0) {
      const latestSugar = sugarMetrics[0].value;
      if (latestSugar > 250) {
        warnings.push({
          recommendation_type: 'warning',
          title: '⚠️ Very High Blood Sugar',
          description: `Your blood sugar level (${latestSugar} mg/dL) is very high. Please consult with your doctor immediately.`,
          priority: 'urgent',
          category: 'diabetes_emergency'
        });
      } else if (latestSugar > 180) {
        warnings.push({
          recommendation_type: 'warning',
          title: '⚠️ Elevated Blood Sugar',
          description: `Your blood sugar (${latestSugar} mg/dL) is elevated. Monitor closely and consult your doctor if it persists.`,
          priority: 'high',
          category: 'diabetes_alert'
        });
      }
    }

    // Save warnings to database
    if (warnings.length > 0) {
      const warningsToInsert = warnings.map(warning => ({
        patient_id: patientId,
        ...warning,
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        created_by: null // System-generated
      }));

      // Deactivate old warnings
      await supabase
        .from('health_recommendations')
        .update({ is_active: false })
        .eq('patient_id', patientId)
        .eq('recommendation_type', 'warning')
        .is('created_by', null);

      // Insert new warnings
      const { error: insertError } = await supabase
        .from('health_recommendations')
        .insert(warningsToInsert);

      if (insertError) {
        console.error('Error inserting warnings:', insertError);
      }
    }

    return warnings;
  } catch (error) {
    console.error('Error generating warnings:', error);
    throw error;
  }
}

module.exports = {
  generateRecommendations,
  generateWarnings
};

