// 국세청 사업자등록정보 진위확인 및 상태조회 서비스
interface BusinessRegistrationInfo {
  valid: boolean;
  status: 'active' | 'closed' | 'suspended' | 'unknown';
  businessName?: string;
  representativeName?: string;
  businessAddress?: string;
  businessType?: string;
  errorMessage?: string;
}

export async function verifyBusinessRegistration(
  businessNumber: string
): Promise<BusinessRegistrationInfo> {
  try {
    // 사업자등록번호 형식 검증 (10자리 숫자)
    const cleanNumber = businessNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length !== 10) {
      return {
        valid: false,
        status: 'unknown',
        errorMessage: '사업자등록번호는 10자리 숫자여야 합니다.'
      };
    }

    const apiKey = process.env.NTS_API_KEY;
    if (!apiKey) {
      throw new Error('NTS_API_KEY가 설정되지 않았습니다.');
    }

    // 국세청 API URL
    const apiUrl = 'https://api.odcloud.kr/api/nts-businessman/v1/status';
    
    const requestBody = {
      b_no: [cleanNumber] // 배열 형태로 전송
    };

    const response = await fetch(`${apiUrl}?serviceKey=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // API 응답 구조에 따른 처리
    if (data.match_cnt === 0 || !data.data || data.data.length === 0) {
      return {
        valid: false,
        status: 'unknown',
        errorMessage: '등록되지 않은 사업자등록번호입니다.'
      };
    }

    const businessInfo = data.data[0];
    
    // 사업자 상태 확인
    let status: 'active' | 'closed' | 'suspended' | 'unknown' = 'unknown';
    
    // b_stt: 납세자상태 (01:계속사업자, 02:휴업자, 03:폐업자)
    // tax_type: 과세유형 (01:부가가치세 일반과세자, 02:부가가치세 간이과세자, 03:부가가치세 면세사업자, 04:수익사업을 영위하지 않는 비영리법인, 05:고유번호가 부여된 단체,개인)
    
    switch (businessInfo.b_stt) {
      case '01':
        status = 'active';
        break;
      case '02':
        status = 'suspended';
        break;
      case '03':
        status = 'closed';
        break;
      default:
        status = 'unknown';
    }

    // 운영 중인 사업자만 유효한 것으로 판단
    const isValid = status === 'active';

    return {
      valid: isValid,
      status,
      businessName: businessInfo.tax_type_name || undefined,
      representativeName: businessInfo.p_nm || undefined,
      businessAddress: businessInfo.addr || undefined,
      businessType: businessInfo.tob_nm || undefined,
      errorMessage: !isValid ? '현재 운영 중이지 않은 사업자입니다.' : undefined
    };

  } catch (error) {
    console.error('사업자등록번호 검증 오류:', error);
    return {
      valid: false,
      status: 'unknown',
      errorMessage: error instanceof Error ? error.message : '검증 중 오류가 발생했습니다.'
    };
  }
}