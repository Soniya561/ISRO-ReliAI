"""
Risk Engine
Combines Module A (Isolation Forest) and Module B (LSTM) results
into final risk classification and recommendations
"""
from config import Config

class RiskEngine:
    """
    Risk classification engine combining anomaly detection and drift prediction
    
    Decision Logic:
    - NORMAL: No anomaly detected AND normal prediction
    - WARNING: Anomaly OR warning/high-risk prediction detected
    - HIGH_RISK: Anomaly detected AND high-risk prediction
    """
    
    # Risk levels
    RISK_LEVELS = ['NORMAL', 'WARNING', 'HIGH_RISK']
    
    # LSTM class mapping (must match model output)
    LSTM_CLASSES = ['NORMAL', 'WARNING', 'HIGH_RISK']
    
    @staticmethod
    def classify_risk(anomaly_result, drift_result):
        """
        Classify component risk based on both module results
        
        Args:
            anomaly_result: dict with 'anomaly' (bool), 'score' (float)
            drift_result: dict with 'class_index' (int), 'confidence' (float), 'probabilities' (list)
        
        Returns:
            dict with 'risk_level', 'explanation', 'recommendation'
        """
        
        # Check for errors
        if anomaly_result.get('error') or drift_result.get('error'):
            return {
                'risk_level': 'ERROR',
                'confidence': 0.0,
                'explanation': f"Module error: {anomaly_result.get('error') or drift_result.get('error')}",
                'recommendation': 'Please check backend logs for details.'
            }
        
        has_anomaly = anomaly_result.get('anomaly', False)
        anomaly_score = anomaly_result.get('score', 0.0)
        
        lstm_class_idx = drift_result.get('class_index', 0)
        lstm_confidence = drift_result.get('confidence', 0.0)
        lstm_class = RiskEngine.LSTM_CLASSES[lstm_class_idx] if lstm_class_idx < len(RiskEngine.LSTM_CLASSES) else 'UNKNOWN'
        
        # Decision logic
        if has_anomaly and lstm_class == 'HIGH_RISK':
            # HIGH_RISK: Strong anomaly evidence + strong predicted risk
            risk_level = 'HIGH_RISK'
            confidence = min(abs(anomaly_score), lstm_confidence)
            explanation = (
                "The component shows strong abnormal behaviour together with elevated "
                "predicted risk. This indicates potential reliability issues that require "
                "immediate attention."
            )
            recommendation = (
                "This component requires further inspection and should be subject to "
                "enhanced testing before deployment. Consider reviewing burn-in parameters."
            )
        
        elif has_anomaly or lstm_class in ['WARNING', 'HIGH_RISK']:
            # WARNING: Anomaly OR warning/high-risk prediction
            risk_level = 'WARNING'
            confidence = max(abs(anomaly_score) if has_anomaly else 0.0, lstm_confidence)
            
            reason_parts = []
            if has_anomaly:
                reason_parts.append("abnormal behaviour was detected")
            if lstm_class in ['WARNING', 'HIGH_RISK']:
                reason_parts.append(f"increasing {lstm_class.lower()} risk was predicted")
            
            reason_str = " and ".join(reason_parts) if reason_parts else "elevated risk indicators"
            
            explanation = (
                f"Component behaviour requires monitoring because {reason_str}. "
                "Continued observation and targeted screening is recommended."
            )
            recommendation = (
                "Continue monitoring the component closely. Extended burn-in testing "
                "and periodic re-screening are advised."
            )
        
        else:
            # NORMAL: No anomaly + normal prediction
            risk_level = 'NORMAL'
            confidence = min(1.0 - abs(anomaly_score), lstm_confidence) if lstm_confidence > 0 else 0.9
            explanation = (
                "Component behaviour is consistent with the learned normal pattern. "
                "No significant anomalies or reliability risks were detected during analysis."
            )
            recommendation = (
                "Component may proceed with standard screening procedures. "
                "Routine monitoring is sufficient."
            )
        
        return {
            'risk_level': risk_level,
            'confidence': float(confidence),
            'explanation': explanation,
            'recommendation': recommendation
        }
    
    @staticmethod
    def generate_report(component_id, module_a_result, module_b_result, risk_classification):
        """
        Generate complete analysis report
        
        Returns:
            dict with complete analysis including module results and final decision
        """
        return {
            'component_id': component_id,
            
            'module_a': {
                'name': 'Anomaly Detection (Isolation Forest)',
                'status': module_a_result.get('status', 'ERROR'),
                'anomaly': module_a_result.get('anomaly'),
                'anomaly_score': module_a_result.get('score'),
                'error': module_a_result.get('error')
            },
            
            'module_b': {
                'name': 'Drift Prediction (LSTM)',
                'prediction': RiskEngine.LSTM_CLASSES[module_b_result.get('class_index', 0)] if module_b_result.get('class_index') is not None else 'ERROR',
                'confidence': module_b_result.get('confidence'),
                'probabilities': {
                    RiskEngine.LSTM_CLASSES[i]: module_b_result.get('probabilities', [0,0,0])[i]
                    for i in range(len(RiskEngine.LSTM_CLASSES))
                } if module_b_result.get('probabilities') else {},
                'error': module_b_result.get('error')
            },
            
            'final_risk': {
                'level': risk_classification.get('risk_level'),
                'confidence': risk_classification.get('confidence'),
                'explanation': risk_classification.get('explanation'),
                'recommendation': risk_classification.get('recommendation')
            }
        }
