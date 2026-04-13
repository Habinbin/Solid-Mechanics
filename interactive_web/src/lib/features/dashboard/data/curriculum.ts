export type PageInfo = {
    title: string;
    path: string;
    description: string;
    icon?: string;
    disabled?: boolean;
};

export type ChapterInfo = {
    title: string;
    pages: PageInfo[];
};

export const curriculumData: ChapterInfo[] = [
    {
        title: '응력과 변형률의 기초 (Basic Concepts of Stress and Strain)',
        pages: [
            {
                title: '수직 변형률 유도 (Normal Strain Derivation)',
                description: '미소 요소에서의 수직 변형률 유도 과정 (Partial Derivatives)',
                path: '/examples/normal-strain-derivation',
                icon: '📏'
            },
            {
                title: '축 하중과 수직 변형 (Axial Force & Strain)',
                description: '후크의 법칙과 1차원 축력 시뮬레이션',
                path: '/examples/axial-force',
                icon: '🏋️‍♂️'
            },
            {
                title: '2차원 전단 변형률 (2D Shear Strain)',
                description: '직교축의 각도 변화에 따른 전단 변형 시각화',
                path: '/examples/shear-strain',
                icon: '✂️'
            }
        ]
    },
    {
        title: '응력과 변형률의 변환 (Stress and Strain Transformations)',
        pages: [
            {
                title: '2차원 쐐기 요소 (Cauchy Stress - Wedge Element)',
                description: '코시 응력 정리를 이용한 단면 응력 변환',
                path: '/examples/wedge-element',
                icon: '📐'
            },
            {
                title: '2차원 경사면 응력 (Stress on an Inclined Plane)',
                description: '일축 하중 하의 임의 경사면 내부 응력',
                path: '/examples/inclined-plane',
                icon: '🔪'
            },
            {
                title: '2차원 평면 응력 요소 (2D Stress Element)',
                description: '일반 평면 응력 상태에서의 힘 평형',
                path: '/examples/stress-element',
                icon: '⏹️'
            },
            {
                title: '모어 원 (Mohr\'s Circle & Transformation)',
                description: '경사면 각도 변화에 따른 응력 변화와 모어 원 궤적',
                path: '/examples/mohrs-circle',
                icon: '⭕'
            },
            {
                title: '3차원 모어 원 (3D Mohr\'s Circle)',
                description: '3차원 주응력과 최대 전단응력의 구속 영역',
                path: '/examples/3d-mohrs-circle',
                icon: '🔴'
            },
            {
                title: '3차원 변형률과 방향여현 (3D Strain & Invariants)',
                description: '3차원 방향여현(l,m,n)과 변형률 불변량(J1, J2, J3)',
                path: '/examples/3d-strain-transformation',
                icon: '🧊'
            }
        ]
    },
    {
        title: '재료의 역학적 거동 (Mechanical Behavior - Upcoming)',
        pages: [
            {
                title: '원형 축의 비틀림 (Torsion)',
                description: '전단 응력과 비틀림 각도의 관계',
                path: '#',
                disabled: true,
                icon: '🔄'
            },
            {
                title: '보의 굽힘 (Bending of Beams)',
                description: '모멘트에 의한 굽힘 응력과 단면 2차 모멘트',
                path: '#',
                disabled: true,
                icon: '🏗️'
            }
        ]
    }
];
