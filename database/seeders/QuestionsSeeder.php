<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\FirebaseCrudService;

class QuestionsSeeder extends Seeder
{
    protected $firebase;

    public function __construct(FirebaseCrudService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function run(): void
    {
        $questions = [
            [
                'id' => 1,
                'question' => "I enjoy assembling computer hardware components and setting up network equipment",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],
            [
                'id' => 2,
                'question' => "I prefer working with physical technology like servers, routers, and hardware devices",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],
            [
                'id' => 3,
                'question' => "I find satisfaction in troubleshooting and repairing technical hardware issues",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],
            [
                'id' => 4,
                'question' => "I enjoy configuring and maintaining physical IT infrastructure",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],
            [
                'id' => 5,
                'question' => "I prefer hands-on technical work over theoretical planning",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],
            [
                'id' => 6,
                'question' => "I like working with tools and equipment to solve technical problems",
                'main_category' => 'RIASEC',
                'sub_category' => 'Realistic'
            ],

            [
                'id' => 7,
                'question' => "I enjoy analyzing complex algorithms and data structures to solve problems",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 8,
                'question' => "I find satisfaction in researching new programming languages and emerging technologies",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 9,
                'question' => "I prefer investigating root causes of software bugs and system failures",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 10,
                'question' => "I enjoy conducting experiments and testing hypotheses in software development",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 11,
                'question' => "I like analyzing data patterns to identify trends and insights",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 12,
                'question' => "I find satisfaction in solving complex technical puzzles and challenges",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 13,
                'question' => "I enjoy reading technical documentation and research papers",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],
            [
                'id' => 14,
                'question' => "I prefer working on problems that require deep analytical thinking",
                'main_category' => 'RIASEC',
                'sub_category' => 'Investigative'
            ],

            [
                'id' => 15,
                'question' => "I enjoy designing user-friendly and visually appealing software interfaces",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 16,
                'question' => "I find satisfaction in creating innovative software solutions that enhance user experience",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 17,
                'question' => "I prefer working on creative projects that allow me to express my design ideas",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 18,
                'question' => "I enjoy developing unique and original software features",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 19,
                'question' => "I like creating engaging user experiences through creative design",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 20,
                'question' => "I find satisfaction in building aesthetically pleasing and functional applications",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 21,
                'question' => "I enjoy experimenting with new design patterns and creative solutions",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],
            [
                'id' => 22,
                'question' => "I prefer projects that allow me to think outside the box and innovate",
                'main_category' => 'RIASEC',
                'sub_category' => 'Artistic'
            ],

            [
                'id' => 23,
                'question' => "I find fulfillment in mentoring junior developers and helping them grow",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 24,
                'question' => "I enjoy conducting training sessions on new software tools and technologies",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 25,
                'question' => "I prefer working in teams and collaborating with others on IT projects",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 26,
                'question' => "I find satisfaction in helping users understand and effectively use technology",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 27,
                'question' => "I enjoy providing technical support and assistance to colleagues",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 28,
                'question' => "I like facilitating communication between technical and non-technical team members",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 29,
                'question' => "I find fulfillment in teaching others programming concepts and best practices",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],
            [
                'id' => 30,
                'question' => "I prefer roles where I can help others solve their technical challenges",
                'main_category' => 'RIASEC',
                'sub_category' => 'Social'
            ],

            [
                'id' => 31,
                'question' => "I enjoy leading a team to develop and launch new software products",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 32,
                'question' => "I find satisfaction in negotiating contracts and managing client relationships for IT services",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 33,
                'question' => "I prefer roles where I can influence strategic technology decisions",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 34,
                'question' => "I enjoy managing IT projects and coordinating team efforts",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 35,
                'question' => "I like presenting technical solutions to business stakeholders",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 36,
                'question' => "I find satisfaction in building and leading high-performing development teams",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 37,
                'question' => "I enjoy identifying business opportunities and proposing technology solutions",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],
            [
                'id' => 38,
                'question' => "I prefer roles where I can drive innovation and business growth through technology",
                'main_category' => 'RIASEC',
                'sub_category' => 'Enterprising'
            ],

            [
                'id' => 39,
                'question' => "I prefer organizing and managing databases to ensure data integrity and accuracy",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 40,
                'question' => "I enjoy developing and enforcing IT policies and procedures",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 41,
                'question' => "I find satisfaction in maintaining organized documentation and system records",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 42,
                'question' => "I prefer working with structured data and following established protocols",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 43,
                'question' => "I enjoy ensuring systems operate according to predefined standards and processes",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 44,
                'question' => "I like creating systematic workflows and standardized processes for IT operations",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 45,
                'question' => "I find satisfaction in maintaining accurate records and documentation",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],
            [
                'id' => 46,
                'question' => "I prefer roles that require attention to detail and systematic organization",
                'main_category' => 'RIASEC',
                'sub_category' => 'Conventional'
            ],

            [
                'id' => 47,
                'question' => "I work well with others to complete IT projects successfully",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Teamwork'
            ],
            [
                'id' => 48,
                'question' => "I am helpful and cooperative when working with team members on software development",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Teamwork'
            ],
            [
                'id' => 49,
                'question' => "I enjoy participating in team meetings to discuss project progress and technical solutions",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Teamwork'
            ],
            [
                'id' => 50,
                'question' => "I prefer collaborating with cross-functional teams to achieve project goals",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Teamwork'
            ],
            [
                'id' => 51,
                'question' => "I find satisfaction in working together with colleagues to solve complex technical problems",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Teamwork'
            ],

            [
                'id' => 52,
                'question' => "I work best independently and prefer focusing deeply on my own technical tasks",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Independent'
            ],
            [
                'id' => 53,
                'question' => "I prefer working alone rather than in a group when solving technical problems",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Independent'
            ],
            [
                'id' => 54,
                'question' => "I am more productive when I can concentrate on individual coding tasks without frequent interruptions",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Independent'
            ],

            [
                'id' => 55,
                'question' => "I am careful about details and thorough when writing code and completing software development tasks",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],
            [
                'id' => 56,
                'question' => "I meticulously review code to identify and fix bugs before deployment",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],
            [
                'id' => 57,
                'question' => "I notice when something is wrong or likely to go wrong in software systems",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],
            [
                'id' => 58,
                'question' => "I pay attention to small details that others might miss when developing software",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],
            [
                'id' => 59,
                'question' => "I am careful in documenting software development processes and system configurations",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],
            [
                'id' => 60,
                'question' => "I ensure code quality by carefully checking every detail before submitting my work",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Detail-Oriented'
            ],

            [
                'id' => 61,
                'question' => "I prefer seeing the big picture and understanding overall system architecture",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Big Picture'
            ],
            [
                'id' => 62,
                'question' => "I focus on high-level design and system integration rather than individual code details",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Big Picture'
            ],
            [
                'id' => 63,
                'question' => "I prefer understanding how different components work together rather than focusing on specific implementation details",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Big Picture'
            ],

            [
                'id' => 64,
                'question' => "I follow established coding standards and best practices consistently",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Process-Oriented'
            ],
            [
                'id' => 65,
                'question' => "I prefer following structured development processes and methodologies",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Process-Oriented'
            ],
            [
                'id' => 66,
                'question' => "I enjoy following established procedures and guidelines in software development",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Process-Oriented'
            ],
            [
                'id' => 67,
                'question' => "I prefer working with defined processes rather than improvising solutions",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Process-Oriented'
            ],
            [
                'id' => 68,
                'question' => "I consistently follow software development lifecycle processes",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Process-Oriented'
            ],

            [
                'id' => 69,
                'question' => "I prefer focusing on delivering results quickly rather than following strict processes",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Initiative'
            ],
            [
                'id' => 70,
                'question' => "I take initiative and work independently to solve problems without waiting for instructions",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Initiative'
            ],
            [
                'id' => 71,
                'question' => "I proactively suggest improvements to existing IT systems and processes",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Initiative'
            ],
            [
                'id' => 72,
                'question' => "I am willing to take on challenging projects without being asked",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Initiative'
            ],

            [
                'id' => 73,
                'question' => "I work best with clear structure, deadlines, and defined milestones",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Structured'
            ],
            [
                'id' => 74,
                'question' => "I prefer having well-defined project requirements and structured workflows",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Structured'
            ],
            [
                'id' => 75,
                'question' => "I perform better when I have clear guidelines and structured processes to follow",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Structured'
            ],
            [
                'id' => 76,
                'question' => "I prefer working in environments with established routines and structured schedules",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Structured'
            ],

            [
                'id' => 77,
                'question' => "I adapt easily to changes in project requirements and technology stacks",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Adaptability'
            ],
            [
                'id' => 78,
                'question' => "I prefer flexible schedules and adapting my approach as projects evolve",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Adaptability'
            ],
            [
                'id' => 79,
                'question' => "I am open to change and new information when working on IT projects",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Adaptability'
            ],
            [
                'id' => 80,
                'question' => "I can quickly adjust my work approach when priorities or technologies change",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Adaptability'
            ],
            [
                'id' => 81,
                'question' => "I thrive in dynamic environments where I can adapt to changing requirements",
                'main_category' => 'WorkStyle',
                'sub_category' => 'Adaptability'
            ],

            [
                'id' => 82,
                'question' => "I want to work in healthcare technology to make a positive impact on patient care and medical outcomes",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Healthcare'
            ],
            [
                'id' => 83,
                'question' => "I am motivated to work in healthcare IT because it offers opportunities to help people and improve lives",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Healthcare'
            ],
            [
                'id' => 84,
                'question' => "I find fulfillment in developing technology solutions for healthcare and medical systems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Healthcare'
            ],

            [
                'id' => 85,
                'question' => "I prefer working in financial technology because it offers high growth potential and financial stability",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Fintech'
            ],
            [
                'id' => 86,
                'question' => "I am motivated by opportunities to work in fintech and banking systems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Fintech'
            ],
            [
                'id' => 87,
                'question' => "I value working in financial technology industries that offer competitive compensation",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Fintech'
            ],

            [
                'id' => 88,
                'question' => "I want to work in education technology to help improve learning outcomes and educational access",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Edtech'
            ],
            [
                'id' => 89,
                'question' => "I find satisfaction in creating innovative educational technology solutions",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Edtech'
            ],
            [
                'id' => 90,
                'question' => "I am motivated to work in education technology because it allows me to contribute to learning and development",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Edtech'
            ],

            [
                'id' => 91,
                'question' => "I prefer working in e-commerce and retail technology because it offers opportunities for innovation and growth",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'E-commerce'
            ],
            [
                'id' => 92,
                'question' => "I enjoy working in e-commerce technology where I can create innovative shopping experiences",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'E-commerce'
            ],
            [
                'id' => 93,
                'question' => "I value working in e-commerce industries with high growth potential",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'E-commerce'
            ],

            [
                'id' => 94,
                'question' => "I am interested in working with logistics and supply chain technology to optimize operations",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Logistics'
            ],
            [
                'id' => 95,
                'question' => "I find satisfaction in solving complex problems in logistics and supply chain systems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Logistics'
            ],

            [
                'id' => 96,
                'question' => "I prefer working across multiple industries to gain diverse experience and learning opportunities",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Cross-Industry'
            ],
            [
                'id' => 97,
                'question' => "I value the variety and challenge of working with different industries and domains",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Cross-Industry'
            ],

            [
                'id' => 98,
                'question' => "I am passionate about solving cybersecurity and data protection challenges to protect users and organizations",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Cybersecurity'
            ],
            [
                'id' => 99,
                'question' => "I find satisfaction in developing security solutions that prevent cyber threats and protect sensitive data",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Cybersecurity'
            ],
            [
                'id' => 100,
                'question' => "I am motivated by the challenge of staying ahead of cybersecurity threats and vulnerabilities",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Cybersecurity'
            ],

            [
                'id' => 101,
                'question' => "I enjoy optimizing systems for better performance and efficiency",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Performance'
            ],
            [
                'id' => 102,
                'question' => "I find satisfaction in improving system performance and reducing resource consumption",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Performance'
            ],
            [
                'id' => 103,
                'question' => "I am motivated by opportunities to optimize processes and improve efficiency",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Performance'
            ],

            [
                'id' => 104,
                'question' => "I focus on creating intuitive and delightful user experiences that help people accomplish their goals",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'User Experience'
            ],
            [
                'id' => 105,
                'question' => "I find fulfillment in designing user-friendly interfaces that make technology accessible to everyone",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'User Experience'
            ],
            [
                'id' => 106,
                'question' => "I enjoy creating innovative and engaging user experiences through creative design",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'User Experience'
            ],

            [
                'id' => 107,
                'question' => "I love automating repetitive processes to save time and resources for organizations",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Automation'
            ],
            [
                'id' => 108,
                'question' => "I find satisfaction in creating automated solutions that improve efficiency and reduce manual work",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Automation'
            ],
            [
                'id' => 109,
                'question' => "I enjoy developing innovative automation solutions that transform business processes",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Automation'
            ],

            [
                'id' => 110,
                'question' => "I work on data analysis and helping organizations make data-driven decisions",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Data Analysis'
            ],
            [
                'id' => 111,
                'question' => "I find satisfaction in analyzing data patterns to provide insights and recommendations",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Data Analysis'
            ],
            [
                'id' => 112,
                'question' => "I enjoy working with diverse datasets to solve complex analytical problems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Data Analysis'
            ],

            [
                'id' => 113,
                'question' => "I focus on building scalable systems that grow with businesses",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Scalability'
            ],
            [
                'id' => 114,
                'question' => "I find satisfaction in designing systems that can handle increasing loads and complexity",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Scalability'
            ],
            [
                'id' => 115,
                'question' => "I enjoy creating innovative architectural solutions for scalable systems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Scalability'
            ],

            [
                'id' => 116,
                'question' => "I want to help development teams work more efficiently by creating tools and processes",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Team Support'
            ],
            [
                'id' => 117,
                'question' => "I find satisfaction in supporting other developers and improving team productivity",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Team Support'
            ],
            [
                'id' => 118,
                'question' => "I am motivated by opportunities to contribute to team success and achievement",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Team Support'
            ],

            [
                'id' => 119,
                'question' => "I want to create solutions that directly benefit end-users and improve their daily lives",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'End-User Focus'
            ],
            [
                'id' => 120,
                'question' => "I find fulfillment in helping users accomplish their goals through technology",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'End-User Focus'
            ],
            [
                'id' => 121,
                'question' => "I enjoy understanding user needs and creating solutions that truly help people",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'End-User Focus'
            ],

            [
                'id' => 122,
                'question' => "I want to help businesses solve strategic technology challenges and achieve their goals",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Business Solutions'
            ],
            [
                'id' => 123,
                'question' => "I find satisfaction in working with business stakeholders to deliver technology solutions",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Business Solutions'
            ],
            [
                'id' => 124,
                'question' => "I am motivated by opportunities to contribute to business success and growth",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Business Solutions'
            ],

            [
                'id' => 125,
                'question' => "I want to work with specific industries to solve domain-specific problems",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Industry Specialization'
            ],
            [
                'id' => 126,
                'question' => "I find satisfaction in becoming an expert in a particular industry's technology needs",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Industry Specialization'
            ],
            [
                'id' => 127,
                'question' => "I enjoy working with industry experts to develop specialized technology solutions",
                'main_category' => 'Purpose/Goals',
                'sub_category' => 'Industry Specialization'
            ]
        ];

        $this->command->info('Starting to seed questions with categories...');
        $totalQuestions = 0;

        foreach ($questions as $questionData) {
            $fullQuestionData = [
                'id' => $questionData['id'],
                'question' => $questionData['question'],
                'main_category' => $questionData['main_category'],
                'sub_category' => $questionData['sub_category'],
                'created_at' => now()->toIso8601String(),
                'updated_at' => now()->toIso8601String(),
            ];

            try {
                $this->firebase->create('questions', $fullQuestionData);
                $totalQuestions++;
                $this->command->line("  ✓ Added question {$questionData['id']} - {$questionData['main_category']}/{$questionData['sub_category']}");
            } catch (\Exception $e) {
                $this->command->error("  ✗ Failed to add question {$questionData['id']} - " . $e->getMessage());
            }
        }

        $this->command->info("Successfully seeded {$totalQuestions} questions with categories!");
    }
}